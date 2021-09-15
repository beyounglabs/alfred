import * as IORedis from 'ioredis';
import * as moment from 'moment';
import * as zlib from 'zlib';
import { CacheInterface } from '../cache.interface';
import { serialize, deserialize } from 'v8';
import { Apm } from '../../apm/apm';

let redisWriteClient: { [code: string]: IORedis.Redis | undefined } = {};
let redisReadClient: { [code: string]: IORedis.Redis | undefined } = {};
let runningAsFallback: boolean = false;

export class RedisCache implements CacheInterface {
  protected instance: string;
  protected apm?: Apm;

  constructor(instance?: string, apm?: Apm) {
    this.instance = instance || 'default';
    this.apm = apm;
  }

  protected async getWriteClient(): Promise<IORedis.Redis> {
    if (redisWriteClient[this.instance]) {
      return redisWriteClient[this.instance]!;
    }

    const instancePrefix = this.instance.toUpperCase();

    let host: string = process.env.REDIS_CACHE_HOST || 'redis';
    let port: number = process.env.REDIS_CACHE_PORT
      ? Number(process.env.REDIS_CACHE_PORT)
      : 6379;
    let db: number = process.env.REDIS_CACHE_DB
      ? Number(process.env.REDIS_CACHE_DB)
      : 0;

    if (process.env[`REDIS_CACHE_${instancePrefix}_HOST`]) {
      host = process.env[`REDIS_CACHE_${instancePrefix}_HOST`]!;
      port = process.env[`REDIS_CACHE_${instancePrefix}_PORT`]
        ? Number(process.env[`REDIS_CACHE_${instancePrefix}_PORT`])
        : 6379;
      db = process.env[`REDIS_CACHE_${instancePrefix}_DB`]
        ? Number(process.env[`REDIS_CACHE_${instancePrefix}_DB`])
        : 0;
    }

    await this.startSpan('CACHE_CONNECT_WRITE_REDIS', async () => {
      const redisClientNew = new IORedis({
        host,
        port,
        db,
        maxRetriesPerRequest: 5,
      });
      await new Promise((resolve, reject) => {
        redisClientNew.on('error', err => {
          if (runningAsFallback) {
            return;
          }

          if (process.env.REDIS_CACHE_FALLBACK_HOST) {
            const redisClientFallback = new IORedis({
              host: process.env.REDIS_CACHE_FALLBACK_HOST || 'redis',
              port: process.env.REDIS_CACHE_FALLBACK_PORT
                ? Number(process.env.REDIS_CACHE_FALLBACK_PORT)
                : 6379,
              db: process.env.REDIS_CACHE_FALLBACK_DB
                ? Number(process.env.REDIS_CACHE_FALLBACK_DB)
                : 0,
              maxRetriesPerRequest: 5,
            });

            redisClientFallback.on('error', errFallback => {
              reject(`Error on connecting to fallback redis: ${errFallback}`);
            });

            redisClientFallback.on('ready', () => {
              redisWriteClient[this.instance] = redisClientFallback;

              resolve(undefined);

              runningAsFallback = true;
              console.log(`Redis is running with fallback: ${err}`);
            });
          } else {
            reject(`Error on connecting to redis: ${err}`);
          }
        });

        redisClientNew.on('ready', () => {
          redisWriteClient[this.instance] = redisClientNew;

          resolve(undefined);

          runningAsFallback = false;
          console.log('Redis is running with the primary');
        });
      });
    });

    if (!redisWriteClient[this.instance]) {
      throw new Error('No Redis CLient Found');
    }

    return redisWriteClient[this.instance]!;
  }

  protected async getReadClient(): Promise<IORedis.Redis> {
    if (redisReadClient[this.instance]) {
      return redisReadClient[this.instance]!;
    }

    const instancePrefix = this.instance.toUpperCase();

    if (
      !process.env.REDIS_CACHE_SLAVE_HOST &&
      !process.env[`REDIS_CACHE_${instancePrefix}_SLAVE_HOST`]
    ) {
      redisReadClient[this.instance] = await this.getWriteClient();
      return redisReadClient[this.instance]!;
    }

    let host: string = process.env.REDIS_CACHE_SLAVE_HOST || 'redis';
    let port: number = process.env.REDIS_CACHE_SLAVE_PORT
      ? Number(process.env.REDIS_CACHE_SLAVE_PORT)
      : 6379;
    let db: number = process.env.REDIS_CACHE_DB
      ? Number(process.env.REDIS_CACHE_DB)
      : 0;

    if (process.env[`REDIS_CACHE_${instancePrefix}_SLAVE_HOST`]) {
      host = process.env[`REDIS_CACHE_${instancePrefix}_SLAVE_HOST`]!;
      port = process.env[`REDIS_CACHE_${instancePrefix}_SLAVE_PORT`]
        ? Number(process.env[`REDIS_CACHE_${instancePrefix}_SLAVE_PORT`])
        : 6379;
      db = process.env[`REDIS_CACHE_${instancePrefix}_DB`]
        ? Number(process.env[`REDIS_CACHE_${instancePrefix}_DB`])
        : 0;
    }

    await this.startSpan('CACHE_CONNECT_READ_REDIS', async () => {
      const redisClientNew = new IORedis({
        host,
        port,
        db,
        maxRetriesPerRequest: 5,
      });

      await new Promise<any>((resolve, reject) => {
        redisClientNew.on('error', err => {
          if (runningAsFallback) {
            return;
          }

          if (process.env.REDIS_CACHE_FALLBACK_HOST) {
            const redisClientFallback = new IORedis({
              host: process.env.REDIS_CACHE_FALLBACK_HOST || 'redis',
              port: process.env.REDIS_CACHE_FALLBACK_PORT
                ? Number(process.env.REDIS_CACHE_FALLBACK_PORT)
                : 6379,
              db: process.env.REDIS_CACHE_FALLBACK_DB
                ? Number(process.env.REDIS_CACHE_FALLBACK_DB)
                : 0,
              maxRetriesPerRequest: 5,
            });

            redisClientFallback.on('error', errFallback => {
              reject(`Error on connecting to fallback redis: ${errFallback}`);
            });

            redisClientFallback.on('ready', () => {
              redisWriteClient[this.instance] = redisClientFallback;

              resolve(undefined);

              runningAsFallback = true;
              console.log(`Redis is running with fallback: ${err}`);
            });
          } else {
            reject(`Error on connecting to redis: ${err}`);
          }
        });

        redisClientNew.on('ready', () => {
          redisReadClient[this.instance] = redisClientNew;

          resolve(undefined);

          runningAsFallback = false;
          console.log('Redis is running with the primary');
        });
      });
    });

    if (!redisReadClient[this.instance]) {
      throw new Error('No Redis CLient Found');
    }

    return redisReadClient[this.instance]!;
  }

  public async get(cacheHash: string): Promise<any> {
    const client = await this.getReadClient();

    const response = await this.startSpan(
      'CACHE_GET_BUFFER',
      async () => await client.getBuffer(cacheHash),
    );

    if (!response) {
      return;
    }

    // const uncompressedBuffer = await this.startSpan(
    //   'CACHE_DECOMPRESS',
    //   async () => {
    //     return await new Promise<Buffer>((resolve, reject) => {
    //       zlib.brotliDecompress(response, (err, buffer) => {
    //         if (err) {
    //           reject(err);
    //           return;
    //         }
    //         resolve(buffer);
    //       });
    //     });
    //   },
    // );

    // return await this.startSpan('CACHE_DESERIALIZE', async () =>
    //   deserialize(uncompressedBuffer),
    // );

    // return await this.startSpan('CACHE_DESERIALIZE', async () =>
    //   deserialize(response),
    // );

    return await this.startSpan('CACHE_DESERIALIZE', async () =>
      JSON.parse(response),
    );
  }

  public async delete(cacheHash: string): Promise<any> {
    const client = await this.getWriteClient();
    await client.del(cacheHash);
  }

  public async set(
    cacheHash: string,
    data: any,
    expireInSeconds?: number,
  ): Promise<void> {
    const client = await this.getWriteClient();
    let expire = expireInSeconds;

    if (!expire) {
      expire = moment()
        .add(24, 'hours')
        .diff(moment(), 'seconds');
    }

    // const requestBufffer = serialize(data);

    const requestBufffer = JSON.stringify(data);

    // const compressedBuffer = await new Promise<Buffer>((resolve, reject) => {
    //   zlib.brotliCompress(
    //     requestBufffer,
    //     {
    //       params: {
    //         [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
    //       },
    //     },
    //     (err, buffer) => {
    //       if (err) {
    //         reject(err);
    //         return;
    //       }
    //       resolve(buffer);
    //     },
    //   );
    // });
    // await client.setex(cacheHash, expire, compressedBuffer);
    await client.setex(cacheHash, expire, requestBufffer);
  }

  public async clearAll(cachePrefix: string): Promise<void> {
    const client = await this.getWriteClient();
    let nextCursor: string | null = '0';

    while (nextCursor !== null) {
      const result = await client.scan(
        nextCursor!,
        'MATCH',
        cachePrefix + '*',
        'COUNT',
        50,
      );

      nextCursor = result[0];
      const keys = result[1];

      if (keys.length > 0) {
        await client.unlink(keys);
      }

      if (nextCursor === '0') {
        nextCursor = null;
      }
    }
  }

  public async close(): Promise<void> {
    if (redisReadClient[this.instance]) {
      redisReadClient[this.instance]!.disconnect();
      redisReadClient[this.instance] = undefined;
    }

    if (redisWriteClient[this.instance]) {
      redisWriteClient[this.instance]!.disconnect();
      redisWriteClient[this.instance] = undefined;
    }
  }

  protected async startSpan(span: string, func: Function): Promise<any> {
    if (!this.apm) {
      return await func();
    }

    return await this.apm.startSpan(span, func);
  }
}
