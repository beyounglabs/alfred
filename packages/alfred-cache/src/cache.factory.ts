import { Apm } from '@beyounglabs/alfred-apm';
import { CacheInterface } from './cache.interface';
import { LocalCache } from './drivers/local.cache';
import { MemcachedCache } from './drivers/memcached.cache';
import { RedisCache } from './drivers/redis.cache';

export class CacheFactory {
  public static get(instance?: string, apm?: Apm): CacheInterface {
    const instancePrefix = instance?.toUpperCase() || 'default';

    const driver =
      process.env[`CACHE_${instancePrefix}_DRIVER`] ??
      process.env.CACHE_DRIVER ??
      'redis';

    if (
      driver === 'redis' &&
      (process.env.REDIS_CACHE_HOST ||
        process.env[`REDIS_CACHE_${instancePrefix}_HOST`])
    ) {
      return new RedisCache(instance, apm);
    }

    if (driver === 'memcached') {
      return new MemcachedCache(instance, apm);
    }

    return new LocalCache();
  }
}
