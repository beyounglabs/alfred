import * as md5 from 'md5';
import { CacheFactory } from './cache.factory';
import { CacheInterface } from './cache.interface';
import { LocalCache } from './drivers/local.cache';

let driver: CacheInterface = CacheFactory.get();
let isVerifyngOriginalCache: boolean = false;
export class Cache {
  public async verifyOriginalDriverOnError(
    cacheHash: string,
    force: boolean = false,
  ): Promise<void> {
    try {
      if (isVerifyngOriginalCache && !force) {
        return;
      }

      isVerifyngOriginalCache = true;

      const originalDriver = CacheFactory.get();
      await originalDriver.get(cacheHash);
      driver = originalDriver;

      isVerifyngOriginalCache = false;
    } catch (e) {
      setTimeout(() => {
        this.verifyOriginalDriverOnError(cacheHash, true);
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

  public async delete(cacheHash: string): Promise<any> {
    try {
      return await driver.delete(cacheHash);
    } catch (e) {
      console.error(
        `Error on get cache, switching to local cache: ${e.message} `,
      );
      this.verifyOriginalDriverOnError(cacheHash);
      driver = new LocalCache();
      return await driver.delete(cacheHash);
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
    useBuild: boolean = true,
  ): string {
    const build = process.env.BUILD || '';

    return `${this.getHashPrefix()}${cacheName}_${
      useBuild ? `BUILD${build}_` : ''
    }${md5(JSON.stringify(request))}`;
  }
}
