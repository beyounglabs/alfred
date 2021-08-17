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
    let nextCursor: string | null = '0';

    while (nextCursor !== null) {
      const result = await this.getClient().scanAsync([
        nextCursor,
        'MATCH',
        Cache.getPrefix() + '*',
        'COUNT',
        '50',
      ]);

      nextCursor = result[0];
      const keys = result[1];

      await this.getClient().unlinkAsync(keys);

      if (nextCursor === '0') {
        nextCursor = null;
      }
    }
  }
}
