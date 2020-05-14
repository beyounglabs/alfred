import { promisifyAll } from 'bluebird';
import * as moment from 'moment';
import * as redis from 'redis';
import { CacheInterface } from '../cache.interface';
let redisClient;

export class RedisCache implements CacheInterface {
  protected async getClient() {
    if (redisClient && redisClient.connected) {
      return redisClient;
    }

    const redisClientNew = promisifyAll(
      redis.createClient({
        host: process.env.REDIS_CACHE_HOST || 'redis',
        port: process.env.REDIS_CACHE_PORT
          ? Number(process.env.REDIS_CACHE_PORT)
          : 6379,
        db: process.env.REDIS_CACHE_DB || '0',
        connect_timeout: 1500,
      }),
    );

    await new Promise((resolve, reject) => {
      redisClientNew.on('error', err => {
        redisClient = null;

        if (process.env.REDIS_CACHE_FALLBACK_HOST) {
          const redisClientFallback = promisifyAll(
            redis.createClient({
              host: process.env.REDIS_CACHE_FALLBACK_HOST || 'redis',
              port: process.env.REDIS_CACHE_FALLBACK_PORT
                ? Number(process.env.REDIS_CACHE_FALLBACK_PORT)
                : 6379,
              db: process.env.REDIS_CACHE_FALLBACK_DB || '0',
              connect_timeout: 1500,
            }),
          );

          redisClientFallback.on('error', errFallback => {
            reject(`Error on connecting to fallback redis: ${errFallback}`);
          });

          redisClientFallback.on('ready', () => {
            redisClient = redisClientFallback;
            resolve();
            console.log('redis is running with fallback');
          });
        } else {
          reject(`Error on connecting to redis: ${err}`);
        }
      });

      redisClientNew.on('ready', () => {
        redisClient = redisClientNew;
        resolve();
        console.log('redis is running');
      });
    });

    return redisClient;
  }
  public async get(cacheHash: string): Promise<any> {
    const client = await this.getClient();
    const response = await client.getAsync(cacheHash);
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
    await client.setexAsync(cacheHash, expire, JSON.stringify(data));
  }

  public async clearAll(cachePrefix: string): Promise<void> {
    const client = await this.getClient();
    const keys = await client.keysAsync(cachePrefix + '*');
    for (const key of keys) {
      await client.delAsync(key);
    }
  }
}
