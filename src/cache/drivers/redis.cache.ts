import * as moment from 'moment';
import * as IORedis from 'ioredis';
import { CacheInterface } from '../cache.interface';

export class RedisCache implements CacheInterface {
  protected instance: string;
  protected redisWriteClient: IORedis.Redis | null = null;
  protected redisReadClient: IORedis.Redis | null = null;
  protected runningAsFallback: boolean = false;
  constructor(instance?: string) {
    this.instance = instance || 'default';
  }

  protected async getWriteClient(): Promise<IORedis.Redis> {
    if (this.redisWriteClient) {
      return this.redisWriteClient;
    }

    const instancePrefix = this.instance.toUpperCase();

    let host: string = process.env.REDIS_CACHE_HOST || 'redis';
    let port: number = process.env.REDIS_CACHE_PORT
      ? Number(process.env.REDIS_CACHE_PORT)
      : 6379;
    let db: number = process.env.REDIS_CACHE_DB
      ? Number(process.env.REDIS_CACHE_DB)
      : 0;

    if (process.env[`REDIS_CACHE_${instancePrefix}_HOST`]) {
      host = process.env[`REDIS_CACHE_${instancePrefix}_HOST`]!;
      port = process.env[`REDIS_CACHE_${instancePrefix}_PORT`]
        ? Number(process.env[`REDIS_CACHE_${instancePrefix}_PORT`])
        : 6379;
      db = process.env[`REDIS_CACHE_${instancePrefix}_DB`]
        ? Number(process.env[`REDIS_CACHE_${instancePrefix}_DB`])
        : 0;
    }

    const redisClientNew = new IORedis({
      host,
      port,
      db,
      maxRetriesPerRequest: 5,
    });

    await new Promise((resolve, reject) => {
      redisClientNew.on('error', err => {
        if (this.runningAsFallback) {
          return;
        }

        if (process.env.REDIS_CACHE_FALLBACK_HOST) {
          const redisClientFallback = new IORedis({
            host: process.env.REDIS_CACHE_FALLBACK_HOST || 'redis',
            port: process.env.REDIS_CACHE_FALLBACK_PORT
              ? Number(process.env.REDIS_CACHE_FALLBACK_PORT)
              : 6379,
            db: process.env.REDIS_CACHE_FALLBACK_DB
              ? Number(process.env.REDIS_CACHE_FALLBACK_DB)
              : 0,
            maxRetriesPerRequest: 5,
          });

          redisClientFallback.on('error', errFallback => {
            reject(`Error on connecting to fallback redis: ${errFallback}`);
          });

          redisClientFallback.on('ready', () => {
            this.redisWriteClient = redisClientFallback;

            resolve(undefined);

            this.runningAsFallback = true;
            console.log(`Redis is running with fallback: ${err}`);
          });
        } else {
          reject(`Error on connecting to redis: ${err}`);
        }
      });

      redisClientNew.on('ready', () => {
        this.redisWriteClient = redisClientNew;

        resolve(undefined);

        this.runningAsFallback = false;
        console.log('Redis is running with the primary');
      });
    });

    if (!this.redisWriteClient) {
      throw new Error('No Redis CLient Found');
    }

    return this.redisWriteClient;
  }

  protected async getReadClient(): Promise<IORedis.Redis> {
    if (this.redisReadClient) {
      return this.redisReadClient;
    }

    const instancePrefix = this.instance.toUpperCase();

    if (
      !process.env.REDIS_CACHE_SLAVE_HOST &&
      !process.env[`REDIS_CACHE_${instancePrefix}_SLAVE_HOST`]
    ) {
      this.redisReadClient = await this.getWriteClient();
      return this.redisReadClient;
    }

    let host: string = process.env.REDIS_CACHE_SLAVE_HOST || 'redis';
    let port: number = process.env.REDIS_CACHE_SLAVE_PORT
      ? Number(process.env.REDIS_CACHE_SLAVE_PORT)
      : 6379;
    let db: number = process.env.REDIS_CACHE_DB
      ? Number(process.env.REDIS_CACHE_DB)
      : 0;

    if (process.env[`REDIS_CACHE_${instancePrefix}_SLAVE_HOST`]) {
      host = process.env[`REDIS_CACHE_${instancePrefix}_SLAVE_HOST`]!;
      port = process.env[`REDIS_CACHE_${instancePrefix}_SLAVE_PORT`]
        ? Number(process.env[`REDIS_CACHE_${instancePrefix}_SLAVE_PORT`])
        : 6379;
      db = process.env[`REDIS_CACHE_${instancePrefix}_DB`]
        ? Number(process.env[`REDIS_CACHE_${instancePrefix}_DB`])
        : 0;
    }

    const redisClientNew = new IORedis({
      host,
      port,
      db,
      maxRetriesPerRequest: 5,
    });

    await new Promise<any>((resolve, reject) => {
      redisClientNew.on('error', err => {
        if (this.runningAsFallback) {
          return;
        }

        if (process.env.REDIS_CACHE_FALLBACK_HOST) {
          const redisClientFallback = new IORedis({
            host: process.env.REDIS_CACHE_FALLBACK_HOST || 'redis',
            port: process.env.REDIS_CACHE_FALLBACK_PORT
              ? Number(process.env.REDIS_CACHE_FALLBACK_PORT)
              : 6379,
            db: process.env.REDIS_CACHE_FALLBACK_DB
              ? Number(process.env.REDIS_CACHE_FALLBACK_DB)
              : 0,
            maxRetriesPerRequest: 5,
          });

          redisClientFallback.on('error', errFallback => {
            reject(`Error on connecting to fallback redis: ${errFallback}`);
          });

          redisClientFallback.on('ready', () => {
            this.redisWriteClient = redisClientFallback;

            resolve(undefined);

            this.runningAsFallback = true;
            console.log(`Redis is running with fallback: ${err}`);
          });
        } else {
          reject(`Error on connecting to redis: ${err}`);
        }
      });

      redisClientNew.on('ready', () => {
        this.redisReadClient = redisClientNew;

        resolve(undefined);

        this.runningAsFallback = false;
        console.log('Redis is running with the primary');
      });
    });

    if (!this.redisReadClient) {
      throw new Error('No Redis CLient Found');
    }

    return this.redisReadClient;
  }

  public async get(cacheHash: string): Promise<any> {
    const client = await this.getReadClient();
    const response = await client.get(cacheHash);
    if (!response) {
      return;
    }

    return JSON.parse(response);
  }

  public async delete(cacheHash: string): Promise<any> {
    const client = await this.getWriteClient();
    await client.del(cacheHash);
  }

  public async set(
    cacheHash: string,
    data: any,
    expireInSeconds?: number,
  ): Promise<void> {
    const client = await this.getWriteClient();
    let expire = expireInSeconds;

    if (!expire) {
      expire = moment().add(24, 'hours').diff(moment(), 'seconds');
    }

    await client.setex(cacheHash, expire, JSON.stringify(data));
  }

  public async clearAll(cachePrefix: string): Promise<void> {
    const client = await this.getWriteClient();
    let nextCursor: string | null = '0';

    while (nextCursor !== null) {
      const result = await client.scan(
        nextCursor!,
        'MATCH',
        cachePrefix + '*',
        'COUNT',
        50,
      );

      nextCursor = result[0];
      const keys = result[1];

      if (keys.length > 0) {
        await client.unlink(keys);
      }

      if (nextCursor === '0') {
        nextCursor = null;
      }
    }
  }

  public async close(): Promise<void> {
    if (this.redisReadClient) {
      this.redisReadClient.disconnect();
      this.redisReadClient = null;
    }

    if (this.redisWriteClient) {
      this.redisWriteClient.disconnect();
      this.redisWriteClient = null;
    }
  }
}
