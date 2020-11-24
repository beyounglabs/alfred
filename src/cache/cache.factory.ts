import { LocalCache } from './drivers/local.cache';
import { CacheInterface } from './cache.interface';
import { RedisCache } from './drivers/redis.cache';

export class CacheFactory {
  public static get(instance?: string): CacheInterface {
    let cache: CacheInterface = new LocalCache();
    if (process.env.REDIS_CACHE_HOST) {
      cache = new RedisCache(instance);
    }

    return cache;
  }
}
