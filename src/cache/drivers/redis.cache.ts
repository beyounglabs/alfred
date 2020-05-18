import * as moment from 'moment';
import * as IORedis from 'ioredis';
import { CacheInterface } from '../cache.interface';
let redisClient: IORedis.Redis | null;
let runningAsFallback: boolean = false;

export class RedisCache implements CacheInterface {
  protected async getClient(): Promise<IORedis.Redis> {
    if (redisClient) {
      return redisClient;
    }

    const redisClientNew = new IORedis({
      host: process.env.REDIS_CACHE_HOST || 'redis',
      port: process.env.REDIS_CACHE_PORT
        ? Number(process.env.REDIS_CACHE_PORT)
        : 6379,
      db: process.env.REDIS_CACHE_DB ? Number(process.env.REDIS_CACHE_DB) : 0,
    });

    await new Promise((resolve, reject) => {
      redisClientNew.on('error', err => {
        redisClient = null;

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
          });

          redisClientFallback.on('error', errFallback => {
            reject(`Error on connecting to fallback redis: ${errFallback}`);
          });

          redisClientFallback.on('ready', () => {
            redisClient = redisClientFallback;
            resolve();
            runningAsFallback = true;
            console.log('redis is running with fallback');
          });
        } else {
          reject(`Error on connecting to redis: ${err}`);
        }
      });

      redisClientNew.on('ready', () => {
        redisClient = redisClientNew;
        resolve();
        runningAsFallback = false;
        console.log('redis is running');
      });
    });

    if (!redisClient) {
      throw new Error('No Redis CLient Found');
    }

    return redisClient;
  }
  public async get(cacheHash: string): Promise<any> {
    const client = await this.getClient();
    const response = await client.get(cacheHash);
    if (!response) {
      return;
    }

    return JSON.parse(response);
  }

  public async set(
    cacheHash: string,
    data: any,
    expireInSeconds?: number,
  ): Promise<void> {
    const client = await this.getClient();
    let expire = expireInSeconds;

    if (!expire) {
      expire = moment()
        .add(24, 'hours')
        .diff(moment(), 'seconds');
    }
    await client.setex(cacheHash, expire, JSON.stringify(data));
  }

  public async clearAll(cachePrefix: string): Promise<void> {
    const client = await this.getClient();
    const keys = await client.keys(cachePrefix + '*');
    for (const key of keys) {
      await client.del(key);
    }
  }
}
