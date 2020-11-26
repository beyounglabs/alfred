import { LocalCache } from './drivers/local.cache';
import { CacheInterface } from './cache.interface';
import { RedisCache } from './drivers/redis.cache';

export class CacheFactory {
  public static get(instance?: string): CacheInterface {
    let cache: CacheInterface = new LocalCache();
    const instancePrefix = instance?.toUpperCase() || 'default';
    if (
      process.env.REDIS_CACHE_HOST ||
      process.env[`REDIS_CACHE_${instancePrefix}_HOST`]
    ) {
      cache = new RedisCache(instance);
    }

    return cache;
  }
}
