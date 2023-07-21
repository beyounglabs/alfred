// Based on https://github.com/eggytronixx/express-brute-redis-store
import IORedis, { Cluster, ClusterOptions, RedisOptions } from 'ioredis';
import * as AbstractClientStore from 'express-brute/lib/AbstractClientStore';
import {
  createConnection,
  RedisCustomOptions,
} from '@beyounglabs/alfred/brain/redis.manager';

interface Settings {
  prefix: string;
}

interface Options {
  settings?: Settings;
  redisOptions?: RedisCustomOptions;
}

export class RedisStore extends AbstractClientStore {
  public static defaultOptions: Options = {
    settings: { prefix: '' },
    redisOptions: {
      host: '127.0.0.1',
      port: 6379,
      mode: 'standard',
    },
  };

  private client: IORedis | Cluster;

  private settings: Settings;

  private redisOptions: RedisCustomOptions;

  constructor(options: RedisStore | Options | undefined) {
    super();

    if (options instanceof RedisStore) {
      this.client = options.client;
      this.redisOptions = options.redisOptions;
      this.settings = arguments[1];
    } else {
      if (options) {
        options.settings =
          options.settings || RedisStore.defaultOptions.settings;
        options.redisOptions =
          options.redisOptions || RedisStore.defaultOptions.redisOptions;
      } else {
        options = RedisStore.defaultOptions;
      }

      this.settings = options.settings!;
      this.redisOptions = options.redisOptions!;

      this.client = createConnection(this.redisOptions);
    }
  }

  public set(key: string, value: any, lifetime: string | number, callback) {
    lifetime =
      (typeof lifetime === 'string' ? parseInt(lifetime, 10) : lifetime) || 0;

    let multi = this.client.multi();
    let redisKey = this.settings.prefix + key;

    multi.set(redisKey, JSON.stringify(value));

    if (lifetime > 0) multi.expire(redisKey, lifetime);

    multi.exec(err => {
      if (typeof callback == 'function') {
        err ? callback(err) : callback(null);
      }
    });
  }

  public get(key: string, callback) {
    let redisKey = this.settings.prefix + key;

    this.client.get(redisKey, (err, data) => {
      let dataParsed: any = undefined;
      if (data) {
        dataParsed = JSON.parse(data);
        dataParsed.lastRequest = new Date(dataParsed.lastRequest);
        dataParsed.firstRequest = new Date(dataParsed.firstRequest);
      }

      if (typeof callback == 'function') {
        err ? callback(err) : callback(null, dataParsed);
      }
    });
  }

  public reset(key: string, callback) {
    let redisKey = this.settings.prefix + key;

    this.client.del(redisKey, (err, data) => {
      if (typeof callback == 'function') {
        err ? callback(err) : callback(null, data);
      }
    });
  }
}
