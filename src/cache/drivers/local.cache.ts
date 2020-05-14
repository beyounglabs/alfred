import { CacheInterface } from '../cache.interface';

let cache = {};

export class LocalCache implements CacheInterface {
  public async get(cacheHash: string): Promise<any> {
    return cache[cacheHash];
  }

  public async set(
    cacheHash: string,
    data: any,
    expireInSeconds?: number,
  ): Promise<void> {
    cache[cacheHash] = data;
  }

  public async clearAll(cachePrefix: string): Promise<void> {
    cache = {};
  }
}
