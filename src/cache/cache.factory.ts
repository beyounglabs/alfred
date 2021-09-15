import { LocalCache } from './drivers/local.cache';
import { CacheInterface } from './cache.interface';
import { RedisCache } from './drivers/redis.cache';
import { Apm } from '../apm/apm';

export class CacheFactory {
  public static get(instance?: string, apm?: Apm): CacheInterface {
    const instancePrefix = instance?.toUpperCase() || 'default';
    if (
      process.env.REDIS_CACHE_HOST ||
      process.env[`REDIS_CACHE_${instancePrefix}_HOST`]
    ) {
      return new RedisCache(instance, apm);
    }

    return new LocalCache();
  }
}
