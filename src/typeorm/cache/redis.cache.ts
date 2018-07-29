import { promisifyAll } from 'bluebird';
import * as redis from 'redis';
import { Cache } from '../cache';
let redisClient;
export class RedisCache {
  protected getClient() {
    if (redisClient) {
      return redisClient;
    }

    redisClient = promisifyAll(
      redis.createClient({
        host: process.env.REDIS_CACHE_HOST || 'redis',
        port: process.env.REDIS_CACHE_PORT
          ? Number(process.env.REDIS_CACHE_PORT)
          : 6379,
        db: process.env.REDIS_CACHE_DB || '0',
      }),
    );

    return redisClient;
  }

  public async clear() {
    const keys = await this.getClient().keysAsync(Cache.getPrefix() + '*');
    for (const key of keys) {
      await this.getClient().delAsync(key);
    }
  }
}
