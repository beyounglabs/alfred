import { ClientOpts } from 'redis';
import { RedisManager } from './redis.manager';
import { writeFile } from 'fs-extra';

let hasCache: boolean = false;
let cache: any = {};

export class BrainParameter {
  protected service: string;

  protected profile: string;

  protected redis: RedisManager;

  constructor(
    clientOpts: ClientOpts,
    service: string,
    profile: string,
    replicaClientOpts?: ClientOpts,
  ) {
    this.redis = new RedisManager(clientOpts, replicaClientOpts);
    this.service = service;
    this.profile = profile;
  }

  public getKey(): string {
    return `${this.service}:${this.profile}`;
  }

  public async getFromRedis(param?: string): Promise<any> {
    const redisClient = await this.redis.getReadClient();

    return new Promise<any>((resolve, reject) => {
      redisClient.get(this.getKey(), (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          resolve(undefined);
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

        resolve(undefined);
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

  public async dumpEnv() {
    let content = '';
    const keys = Object.keys(process.env)
      .sort()
      .filter(key => {
        return key.startsWith('npm_') === false;
      });

    for (const code of keys) {
      content += `${code}=${process.env[code]}\n`;
    }

    const file = `${__dirname}/../../../../.env.dump`;

    await writeFile(file, content);
  }

  public async updateEnv(skipIfExists: boolean = false) {
    const params = await this.getFromRedis();
    if (params === null || params === undefined) {
      throw new Error('Unable to get parameters from Brain');
    }

    for (const code of Object.keys(params)) {
      if (process.env[code] && skipIfExists) {
        console.info(`Skiping ${code} parameter from Brain`);
        continue;
      }

      process.env[code] = params[code];
    }

    this.dumpEnv().then();
  }

  public async refresh() {
    await this.getFromRedis();
  }

  public closeConnection() {
    this.redis.closeConnection();
  }
}
