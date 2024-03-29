import { Apm } from '@beyounglabs/alfred-apm';
import { Logger, promiseTimeout } from '@beyounglabs/alfred';
import { CacheFactory } from './cache.factory';
import { CacheInterface } from './cache.interface';
import { CompressionInterface } from './compression.interface';
import { LocalCache } from './drivers/local.cache';
import * as hash from 'object-hash';

const drivers: { [code: string]: CacheInterface } = {};

export class Cache {
  
  protected isVerifyngOriginalCache: boolean = false;
  protected instance: string;
  protected apm?: Apm;

  constructor(instance?: string, apm?: Apm) {
    this.instance = instance || 'default';
    this.apm = apm;
    if (!drivers[this.instance]) {
      drivers[this.instance] = CacheFactory.get(this.instance, this.apm);
    }
  }

  public async verifyOriginalDriverOnError(
    cacheHash: string,
    force: boolean = false,
  ): Promise<void> {
    try {
      if (this.isVerifyngOriginalCache && !force) {
        return;
      }

      this.isVerifyngOriginalCache = true;

      const originalDriver = CacheFactory.get(this.instance, this.apm);
      await originalDriver.get(cacheHash);
      drivers[this.instance] = originalDriver;

      this.isVerifyngOriginalCache = false;
    } catch (e) {
      setTimeout(() => {
        this.verifyOriginalDriverOnError(cacheHash, true);
      }, 10000);
    }
  }

  protected async startSpan<T = any>(span: string, func: Function): Promise<T> {
    if (!this.apm) {
      return await func();
    }

    return await this.apm.startSpan<T>(span, func);
  }

  public async get<T = any>(cacheHash: string): Promise<T | null> {
    try {
      if (process.env.CACHE_DISABLED === '1') {
        return null;
      }

      const response = await promiseTimeout(
        [
          async () => {
            return await drivers[this.instance].get(cacheHash);
          },
        ],
        2000,
        'cache_timeout_2000ms',
      );
      
      return response;
      
    } catch (e) {
      return await this.startSpan('CACHE_GET_FALLBACK', async () => {
        Logger.error({
          message: `Error on get cache, switching to local cache: ${e.message} `,
        });
        this.verifyOriginalDriverOnError(cacheHash);
        drivers[this.instance] = new LocalCache();
        return await drivers[this.instance].get(cacheHash);
      });
    }
  }

  public async getMultiple<T = any>(
    cacheHashes: string[],
  ): Promise<Array<T | null>> {
    try {
      if (process.env.CACHE_DISABLED === '1') {
        return cacheHashes.map(cacheHash => null);
      }

      return await drivers[this.instance].getMultiple(cacheHashes);
    } catch (e) {
      return await this.startSpan('CACHE_GET_FALLBACK', async () => {
        Logger.error({
          message: `Error on get cache multiple, switching to local cache: ${e.message} `,
        });

        if (cacheHashes.length > 0) {
          this.verifyOriginalDriverOnError(cacheHashes[0]);
        }
        drivers[this.instance] = new LocalCache();
        return await drivers[this.instance].getMultiple(cacheHashes);
      });
    }
  }

  public async delete(cacheHash: string): Promise<any> {
    try {
      return await drivers[this.instance].delete(cacheHash);
    } catch (e) {
      Logger.error({
        message: `Error on delete cache, switching to local cache: ${e.message} `,
      });

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
      Logger.error({
        message: `Error on set cache, switching to local cache: ${e.message} `,
      });
      this.verifyOriginalDriverOnError(cacheHash);
      drivers[this.instance] = new LocalCache();
      await drivers[this.instance].set(cacheHash, data, expireInSeconds);
    }
  }

  public setCompression(compression: CompressionInterface): void {
    drivers[this.instance].setCompression(compression);
  }

  public async clearAll(): Promise<void> {
    await drivers[this.instance].clearAll(this.getHashPrefix());
  }

  public async close(): Promise<void> {
    await drivers[this.instance].close();
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
    }${hash(request)}`;
  }

  public getDriver(): CacheInterface {
    return drivers[this.instance];
  }
}
