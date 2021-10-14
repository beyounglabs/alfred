import { format } from 'date-fns';
import * as Memcached from 'memcached';
import * as moment from 'moment';
import { hostname } from 'os';
import * as uniqidGenerate from 'uniqid';
import { Apm } from '../../apm/apm';
import { CacheInterface } from '../cache.interface';
import { CompressionInterface } from '../compression.interface';
import { NoCompression } from '../compression/no.compression';

let memcachedWriteClient: { [code: string]: Memcached | undefined } = {};
let memcachedReadClient: { [code: string]: Memcached | undefined } = {};

export class MemcachedCache implements CacheInterface {
  protected instance: string;
  protected apm?: Apm;
  protected compression: CompressionInterface;

  constructor(instance?: string, apm?: Apm) {
    this.instance = instance || 'default';
    this.apm = apm;
    this.compression = new NoCompression();
  }

  public setCompression(compression: CompressionInterface): void {
    this.compression = compression;
  }

  protected async getWriteClient(): Promise<Memcached> {
    if (memcachedWriteClient[this.instance]) {
      return memcachedWriteClient[this.instance]!;
    }

    const instancePrefix = this.instance.toUpperCase();

    let host: string = process.env.MEMCACHED_CACHE_HOST || 'memcached';
    let port: number = process.env.MEMCACHED_CACHE_PORT
      ? Number(process.env.MEMCACHED_CACHE_PORT)
      : 11211;

    if (process.env[`MEMCACHED_CACHE_${instancePrefix}_HOST`]) {
      host = process.env[`MEMCACHED_CACHE_${instancePrefix}_HOST`]!;
      port = process.env[`MEMCACHED_CACHE_${instancePrefix}_PORT`]
        ? Number(process.env[`MEMCACHED_CACHE_${instancePrefix}_PORT`])
        : 11211;
    }

    const connectionHash = uniqidGenerate();
    const hostName = hostname();

    await this.startSpan('CACHE_CONNECT_WRITE_MEMCACHED', async () => {
      const memcachedClientNew = new Memcached([`${host}:${port}`], {
        poolSize: 500,
      });

      console.log(
        `[${connectionHash}] Starting to connect to Write Memcached ${
          this.instance
        } ${hostName} ${format(new Date(), 'YYYY-MM-DD HH:mm:ss')}`,
      );

      memcachedWriteClient[this.instance] = memcachedClientNew;
    });

    if (!memcachedWriteClient[this.instance]) {
      throw new Error('No Memcached Client Found');
    }

    return memcachedWriteClient[this.instance]!;
  }

  protected async getReadClient(): Promise<Memcached> {
    if (memcachedReadClient[this.instance]) {
      return memcachedReadClient[this.instance]!;
    }

    const instancePrefix = this.instance.toUpperCase();

    if (
      !process.env.MEMCACHED_CACHE_SLAVE_HOST &&
      !process.env[`MEMCACHED_CACHE_${instancePrefix}_SLAVE_HOST`]
    ) {
      memcachedReadClient[this.instance] = await this.getWriteClient();
      return memcachedReadClient[this.instance]!;
    }

    if (memcachedReadClient[this.instance]) {
      return memcachedReadClient[this.instance]!;
    }

    let host: string = process.env.MEMCACHED_CACHE_SLAVE_HOST || 'memcached';
    let port: number = process.env.MEMCACHED_CACHE_SLAVE_PORT
      ? Number(process.env.MEMCACHED_CACHE_SLAVE_PORT)
      : 11211;

    if (process.env[`MEMCACHED_CACHE_${instancePrefix}_SLAVE_HOST`]) {
      host = process.env[`MEMCACHED_CACHE_${instancePrefix}_SLAVE_HOST`]!;
      port = process.env[`MEMCACHED_CACHE_${instancePrefix}_SLAVE_PORT`]
        ? Number(process.env[`MEMCACHED_CACHE_${instancePrefix}_SLAVE_PORT`])
        : 11211;
    }

    const connectionHash = uniqidGenerate();
    const hostName = hostname();

    await this.startSpan('CACHE_CONNECT_READ_MEMCACHED', async () => {
      const memcachedClientNew = new Memcached([`${host}:${port}`], {
        poolSize: 500,
      });

      console.log(
        `[${connectionHash}] Starting to connect to Read Memcached ${
          this.instance
        } ${hostName} ${format(new Date(), 'YYYY-MM-DD HH:mm:ss')}`,
      );

      memcachedReadClient[this.instance] = memcachedClientNew;
    });

    if (!memcachedReadClient[this.instance]) {
      throw new Error('No Memcached CLient Found');
    }

    return memcachedReadClient[this.instance]!;
  }

  public async get(cacheHash: string): Promise<any> {
    const client = await this.getReadClient();

    const response = await this.startSpan('CACHE_GET_BUFFER', async () => {
      return await new Promise((resolve, reject) => {
        client.get(cacheHash, function (err, data) {
          if (err) {
            reject(err);
            return;
          }

          console.log('Teste', data);
          resolve(data);
        });
      });
    });

    if (!response) {
      return;
    }

    return await this.startSpan('CACHE_DESERIALIZE', async () =>
      JSON.parse(response),
    );
  }

  public async delete(cacheHash: string): Promise<any> {
    const client = await this.getWriteClient();

    await new Promise((resolve, reject) => {
      client.del(cacheHash, function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(undefined);
      });
    });
  }

  public async set(
    cacheHash: string,
    data: any,
    expireInSeconds?: number,
  ): Promise<void> {
    const client = await this.getWriteClient();

    let expire = expireInSeconds;

    if (!expire) {
      expire = moment().add(24, 'hours').diff(moment(), 'seconds');
    }

    const requestBufffer = JSON.stringify(data);

    await new Promise((resolve, reject) => {
      client.set(cacheHash, requestBufffer, expire, function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(undefined);
      });
    });
  }

  public async clearAll(cachePrefix: string): Promise<void> {
    const client = await this.getWriteClient();
    await new Promise((resolve, reject) => {
      client.flush(function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(undefined);
      });
    });
  }

  public async close(): Promise<void> {
    if (memcachedReadClient[this.instance]) {
      memcachedReadClient[this.instance]!.end();
      memcachedReadClient[this.instance] = undefined;
    }

    if (memcachedWriteClient[this.instance]) {
      memcachedWriteClient[this.instance]!.end();
      memcachedWriteClient[this.instance] = undefined;
    }
  }

  protected async startSpan(span: string, func: Function): Promise<any> {
    if (!this.apm) {
      return await func();
    }

    return await this.apm.startSpan(span, func);
  }
}
