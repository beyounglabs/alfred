import * as md5 from 'md5';
import { CacheFactory } from './cache.factory';
import { CacheInterface } from './cache.interface';
import { LocalCache } from './drivers/local.cache';

let driver: CacheInterface = CacheFactory.get();

export class Cache {
  public async verifyOriginalDriverOnError(cacheHash: string) {
    try {
      const originalDriver = CacheFactory.get();
      await originalDriver.get(cacheHash);
      driver = originalDriver;
    } catch (e) {
      setTimeout(() => {
        this.verifyOriginalDriverOnError(cacheHash);
      }, 10000);
    }
  }

  public async get(cacheHash: string): Promise<any> {
    try {
      return await driver.get(cacheHash);
    } catch (e) {
      console.error(
        `Error on get cache, switching to local cache: ${e.message} `,
      );
      this.verifyOriginalDriverOnError(cacheHash);
      driver = new LocalCache();
      return await driver.get(cacheHash);
    }
  }

  public async set(
    cacheHash: string,
    data: any,
    expireInSeconds?: number,
  ): Promise<void> {
    try {
      await driver.set(cacheHash, data, expireInSeconds);
    } catch (e) {
      console.error(
        `Error on set cache, switching to local cache: ${e.message} `,
      );
      this.verifyOriginalDriverOnError(cacheHash);
      driver = new LocalCache();
      await driver.set(cacheHash, data, expireInSeconds);
    }
  }

  public async clearAll(): Promise<void> {
    await driver.clearAll(this.getHashPrefix());
  }

  public getHashPrefix(): string {
    return `${process.env.BRAIN_SERVICE}_`;
  }

  public generateHash(
    cacheName: string,
    request: any,
    useBuild?: true,
  ): string {
    const build = process.env.BUILD || '';
    return `${this.getHashPrefix()}${useBuild ? build : ''}_${cacheName}-${md5(
      JSON.stringify(request),
    )}`;
  }
}
