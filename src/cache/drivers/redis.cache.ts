import * as moment from 'moment';
import * as IORedis from 'ioredis';
import { CacheInterface } from '../cache.interface';
let redisWriteClient: IORedis.Redis | null;
let redisReadClient: IORedis.Redis | null;
let runningAsFallback: boolean = false;

export class RedisCache implements CacheInterface {
  protected async getWriteClient(): Promise<IORedis.Redis> {
    if (redisWriteClient) {
      return redisWriteClient;
    }

    console.log('Creating Redis Write Client');

    const redisClientNew = new IORedis({
      host: process.env.REDIS_CACHE_HOST || 'redis',
      port: process.env.REDIS_CACHE_PORT
        ? Number(process.env.REDIS_CACHE_PORT)
        : 6379,
      db: process.env.REDIS_CACHE_DB ? Number(process.env.REDIS_CACHE_DB) : 0,
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
            redisWriteClient = redisClientFallback;
            resolve();
            runningAsFallback = true;
            console.log(`Redis is running with fallback: ${err}`);
          });
        } else {
          reject(`Error on connecting to redis: ${err}`);
        }
      });

      redisClientNew.on('ready', () => {
        redisWriteClient = redisClientNew;
        resolve();
        runningAsFallback = false;
        console.log('Redis is running with the primary');
      });
    });

    if (!redisWriteClient) {
      throw new Error('No Redis CLient Found');
    }

    return redisWriteClient;
  }

  protected async getReadClient(): Promise<IORedis.Redis> {
    if (redisReadClient) {
      return redisReadClient;
    }

    if (!process.env.REDIS_CACHE_SLAVE_HOST) {
      redisReadClient = redisWriteClient;
    }

    console.log('Creating Redis Read Client');

    const redisClientNew = new IORedis({
      host: process.env.REDIS_CACHE_SLAVE_HOST || 'redis',
      port: process.env.REDIS_CACHE_SLAVE_PORT
        ? Number(process.env.REDIS_CACHE_SLAVE_PORT)
        : 6379,
      db: process.env.REDIS_CACHE_DB ? Number(process.env.REDIS_CACHE_DB) : 0,
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
            redisWriteClient = redisClientFallback;
            resolve();
            runningAsFallback = true;
            console.log(`Redis is running with fallback: ${err}`);
          });
        } else {
          reject(`Error on connecting to redis: ${err}`);
        }
      });

      redisClientNew.on('ready', () => {
        redisReadClient = redisClientNew;
        resolve();
        runningAsFallback = false;
        console.log('Redis is running with the primary');
      });
    });

    if (!redisReadClient) {
      throw new Error('No Redis CLient Found');
    }

    return redisReadClient;
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
      expire = moment()
        .add(24, 'hours')
        .diff(moment(), 'seconds');
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
