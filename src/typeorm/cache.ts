import { RedisCache } from './cache/redis.cache';

export class Cache {
  public static getPrefix() {
    const prefix = process.env.BRAIN_SERVICE || '';
    return `${prefix}:repository/`;
  }

  public async clear() {
    const redisCache = new RedisCache();
    await redisCache.clear();
  }
}
