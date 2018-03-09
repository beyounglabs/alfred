import { ClientOpts } from 'redis';
import { RedisManager } from './redis.manager';

let hasCache: boolean = false;
let cache: any = {};

export class BrainParameter {
  protected service: string;

  protected profile: string;

  protected redis: RedisManager;

  constructor(clientOpts: ClientOpts, service: string, profile: string) {
    this.redis = new RedisManager(clientOpts);
    this.service = service;
    this.profile = profile;
  }

  public getKey(): string {
    return `${this.service}:${this.profile}`;
  }

  public async getFromRedis(param?: string): Promise<any> {
    const redisClient = await this.redis.getClient();

    return new Promise((resolve, reject) => {
      redisClient.get(this.getKey(), (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          resolve();
          return;
        }

        cache = JSON.parse(result);
        hasCache = true;

        if (param === undefined) {
          resolve(cache);
          return;
        }

        if (cache[param]) {
          resolve(cache[param]);
        }

        resolve();
      });
    });
  }

  public getFromCache(param: string) {
    if (!hasCache) {
      return undefined;
    }

    return cache[param] || undefined;
  }

  public async get(param: string, defaultValue: any): Promise<any> {
    let value: any = null;

    if (hasCache) {
      value = this.getFromCache(param);
      if (value !== undefined) {
        return value;
      }
    }

    value = await this.getFromRedis(param);

    if (value !== undefined) {
      return value;
    }

    return defaultValue;
  }

  public async getRecursive(param: string, defaultValue: any): Promise<any> {
    param = await this.get(param, defaultValue);
    if (cache[param]) {
      return await this.getRecursive(param, null);
    }

    return param;
  }

  public async subscribe(): Promise<any> {
    const redisClient = await this.redis.getSubscribeClient();
    return new Promise(() => {
      redisClient.on('message', async () => {
        await this.updateEnv();
      });

      redisClient.subscribe(this.getKey());
    });
  }

  public async updateEnv() {
    const params = await this.getFromRedis();
    if (params === null || params === undefined) {
      throw new Error('Unable to get parameters from Brain');
    }

    for (const code of Object.keys(params)) {
      process.env[code] = params[code];
    }
  }

  public async refresh() {
    await this.getFromRedis();
  }

  public closeConnection() {
    this.redis.closeConnection();
  }
}
