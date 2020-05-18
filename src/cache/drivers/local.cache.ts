import { CacheInterface } from '../cache.interface';
import * as LRUCache from 'lru-cache';

const options = {
  max: 5000,
  maxAge: 1000 * 60 * 60, // 1 hour
};

let cache = new LRUCache(options);

export class LocalCache implements CacheInterface {
  public async get(cacheHash: string): Promise<any> {
    return cache.get(cacheHash);
  }

  public async set(
    cacheHash: string,
    data: any,
    expireInSeconds?: number,
  ): Promise<void> {
    cache.set(
      cacheHash,
      data,
      expireInSeconds ? expireInSeconds * 1000 : undefined,
    );
  }

  public async clearAll(cachePrefix: string): Promise<void> {
    cache.reset();
  }
}
