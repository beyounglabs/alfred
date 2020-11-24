import * as md5 from 'md5';
import { CacheFactory } from './cache.factory';
import { CacheInterface } from './cache.interface';
import { LocalCache } from './drivers/local.cache';

let drivers: { [code: string]: CacheInterface };
let isVerifyngOriginalCache: boolean = false;
export class Cache {
  protected instance: string;
  constructor(instance?: string) {
    this.instance = instance || 'default';
    drivers[this.instance] = CacheFactory.get(this.instance);
  }

  public async verifyOriginalDriverOnError(
    cacheHash: string,
    force: boolean = false,
  ): Promise<void> {
    try {
      if (isVerifyngOriginalCache && !force) {
        return;
      }

      isVerifyngOriginalCache = true;

      const originalDriver = CacheFactory.get(this.instance);
      await originalDriver.get(cacheHash);
      drivers[this.instance] = originalDriver;

      isVerifyngOriginalCache = false;
    } catch (e) {
      setTimeout(() => {
        this.verifyOriginalDriverOnError(cacheHash, true);
      }, 10000);
    }
  }

  public async get(cacheHash: string): Promise<any> {
    try {
      return await drivers[this.instance].get(cacheHash);
    } catch (e) {
      console.error(
        `Error on get cache, switching to local cache: ${e.message} `,
      );
      this.verifyOriginalDriverOnError(cacheHash);
      drivers[this.instance] = new LocalCache();
      return await drivers[this.instance].get(cacheHash);
    }
  }

  public async delete(cacheHash: string): Promise<any> {
    try {
      return await drivers[this.instance].delete(cacheHash);
    } catch (e) {
      console.error(
        `Error on get cache, switching to local cache: ${e.message} `,
      );
      this.verifyOriginalDriverOnError(cacheHash);
      drivers[this.instance] = new LocalCache();
      return await drivers[this.instance].delete(cacheHash);
    }
  }

  public async set(
    cacheHash: string,
    data: any,
    expireInSeconds?: number,
  ): Promise<void> {
    try {
      await drivers[this.instance].set(cacheHash, data, expireInSeconds);
    } catch (e) {
      console.error(
        `Error on set cache, switching to local cache: ${e.message} `,
      );
      this.verifyOriginalDriverOnError(cacheHash);
      drivers[this.instance] = new LocalCache();
      await drivers[this.instance].set(cacheHash, data, expireInSeconds);
    }
  }

  public async clearAll(): Promise<void> {
    await drivers[this.instance].clearAll(this.getHashPrefix());
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
