import * as moment from 'moment';
import * as IORedis from 'ioredis';
import { CacheInterface } from '../cache.interface';

let redisWriteClient: { [code: string]: IORedis.Redis } = {};
let redisReadClient: { [code: string]: IORedis.Redis } = {};
let runningAsFallback: boolean = false;

export class RedisCache implements CacheInterface {
  protected instance: string;
  constructor(instance?: string) {
    this.instance = instance || 'default';
  }

  protected async getWriteClient(): Promise<IORedis.Redis> {
    if (redisWriteClient[this.instance]) {
      return redisWriteClient[this.instance];
    }

    console.log('Creating Redis Write Client');

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

    const redisClientNew = new IORedis({
      host,
      port,
      db,
      maxRetriesPerRequest: 5,
    });

    await new Promise((resolve, reject) => {
      redisClientNew.on('error', (err) => {
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

          redisClientFallback.on('error', (errFallback) => {
            reject(`Error on connecting to fallback redis: ${errFallback}`);
          });

          redisClientFallback.on('ready', () => {
            redisWriteClient[this.instance] = redisClientFallback;
            resolve();
            runningAsFallback = true;
            console.log(`Redis is running with fallback: ${err}`);
          });
        } else {
          reject(`Error on connecting to redis: ${err}`);
        }
      });

      redisClientNew.on('ready', () => {
        redisWriteClient[this.instance] = redisClientNew;
        resolve();
        runningAsFallback = false;
        console.log('Redis is running with the primary');
      });
    });

    if (!redisWriteClient[this.instance]) {
      throw new Error('No Redis CLient Found');
    }

    return redisWriteClient[this.instance];
  }

  protected async getReadClient(): Promise<IORedis.Redis> {
    if (redisReadClient[this.instance]) {
      return redisReadClient[this.instance];
    }

    const instancePrefix = this.instance.toUpperCase();

    if (
      !process.env.REDIS_CACHE_SLAVE_HOST &&
      !process.env[`REDIS_CACHE_${instancePrefix}_SLAVE_HOST`]
    ) {
      redisReadClient[this.instance] = await this.getWriteClient();
      return redisReadClient[this.instance];
    }

    console.log('Creating Redis Read Client');

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

    const redisClientNew = new IORedis({
      host,
      port,
      db,
      maxRetriesPerRequest: 5,
    });

    await new Promise((resolve, reject) => {
      redisClientNew.on('error', (err) => {
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

          redisClientFallback.on('error', (errFallback) => {
            reject(`Error on connecting to fallback redis: ${errFallback}`);
          });

          redisClientFallback.on('ready', () => {
            redisWriteClient[this.instance] = redisClientFallback;
            resolve();
            runningAsFallback = true;
            console.log(`Redis is running with fallback: ${err}`);
          });
        } else {
          reject(`Error on connecting to redis: ${err}`);
        }
      });

      redisClientNew.on('ready', () => {
        redisReadClient[this.instance] = redisClientNew;
        resolve();
        runningAsFallback = false;
        console.log('Redis is running with the primary');
      });
    });

    if (!redisReadClient[this.instance]) {
      throw new Error('No Redis CLient Found');
    }

    return redisReadClient[this.instance];
  }

  public async get(cacheHash: string): Promise<any> {
    const client = await this.getReadClient();
    const response = await client.get(cacheHash);
    if (!response) {
      return;
    }

    return JSON.parse(response);
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
      expire = moment().add(24, 'hours').diff(moment(), 'seconds');
    }

    await client.setex(cacheHash, expire, JSON.stringify(data));
  }

  public async clearAll(cachePrefix: string): Promise<void> {
    const client = await this.getWriteClient();
    const keys = await client.keys(cachePrefix + '*');
    for (const key of keys) {
      await client.del(key);
    }
  }
}
