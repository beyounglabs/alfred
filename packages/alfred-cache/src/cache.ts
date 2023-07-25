import * as md5 from 'md5';
import { Apm } from '@beyounglabs/alfred-apm';
import { Logger } from '@beyounglabs/alfred';
import { CacheFactory } from './cache.factory';
import { CacheInterface } from './cache.interface';
import { CompressionInterface } from './compression.interface';
import { LocalCache } from './drivers/local.cache';

export class Cache {
  protected drivers: { [code: string]: CacheInterface } = {};
  protected isVerifyngOriginalCache: boolean = false;
  protected instance: string;
  protected apm?: Apm;

  constructor(instance?: string, apm?: Apm) {
    this.instance = instance || 'default';
    this.apm = apm;
    this.drivers[this.instance] = CacheFactory.get(this.instance, this.apm);
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
      this.drivers[this.instance] = originalDriver;

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

      return await this.drivers[this.instance].get(cacheHash);
    } catch (e) {
      return await this.startSpan('CACHE_GET_FALLBACK', async () => {
        Logger.error({
          message: `Error on get cache, switching to local cache: ${e.message} `,
        });
        this.verifyOriginalDriverOnError(cacheHash);
        this.drivers[this.instance] = new LocalCache();
        return await this.drivers[this.instance].get(cacheHash);
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

      return await this.drivers[this.instance].getMultiple(cacheHashes);
    } catch (e) {
      return await this.startSpan('CACHE_GET_FALLBACK', async () => {
        Logger.error({
          message: `Error on get cache multiple, switching to local cache: ${e.message} `,
        });

        if (cacheHashes.length > 0) {
          this.verifyOriginalDriverOnError(cacheHashes[0]);
        }
        this.drivers[this.instance] = new LocalCache();
        return await this.drivers[this.instance].getMultiple(cacheHashes);
      });
    }
  }

  public async delete(cacheHash: string): Promise<any> {
    try {
      return await this.drivers[this.instance].delete(cacheHash);
    } catch (e) {
      Logger.error({
        message: `Error on delete cache, switching to local cache: ${e.message} `,
      });

      this.verifyOriginalDriverOnError(cacheHash);
      this.drivers[this.instance] = new LocalCache();
      return await this.drivers[this.instance].delete(cacheHash);
    }
  }

  public async set(
    cacheHash: string,
    data: any,
    expireInSeconds?: number,
  ): Promise<void> {
    try {
      await this.drivers[this.instance].set(cacheHash, data, expireInSeconds);
    } catch (e) {
      Logger.error({
        message: `Error on set cache, switching to local cache: ${e.message} `,
      });
      this.verifyOriginalDriverOnError(cacheHash);
      this.drivers[this.instance] = new LocalCache();
      await this.drivers[this.instance].set(cacheHash, data, expireInSeconds);
    }
  }

  public setCompression(compression: CompressionInterface): void {
    this.drivers[this.instance].setCompression(compression);
  }

  public async clearAll(): Promise<void> {
    await this.drivers[this.instance].clearAll(this.getHashPrefix());
  }

  public async close(): Promise<void> {
    await this.drivers[this.instance].close();
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

  public getDriver(): CacheInterface {
    return this.drivers[this.instance];
  }
}
