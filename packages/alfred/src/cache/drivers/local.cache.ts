import { CacheInterface } from '../cache.interface';
import * as LRUCache from 'lru-cache';
import { CompressionInterface } from '../compression.interface';

const options = {
  max: 5000,
  maxAge: 1000 * 60 * 60, // 1 hour
};

let cache = new LRUCache(options);

export class LocalCache implements CacheInterface {
  protected compression: CompressionInterface;

  public setCompression(compression: CompressionInterface): void {
    this.compression = compression;
  }

  public async get(cacheHash: string): Promise<any> {
    // change that for structuredClone. Node 17+
    const result = cache.get(cacheHash);
    const type = typeof result;
    if (['string', 'number', 'boolean'].includes(type)) {
      return result;
    }

    if (result === null || result === undefined) {
      return result;
    }

    return JSON.parse(JSON.stringify(result));
  }

  public async getMultiple(cacheHashes: string[]): Promise<any> {
    const result: any[] = [];
    for (const cacheHash of cacheHashes) {
      result.push(this.get(cacheHash));
    }
    return result;
  }

  public async delete(cacheHash: string): Promise<any> {
    return cache.del(cacheHash);
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

  public async close(): Promise<void> {}
}
