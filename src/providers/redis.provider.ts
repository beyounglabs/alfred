import { Service } from 'typedi';
import * as bluebird from 'bluebird';
import * as redis from 'redis';

@Service('redis.provider')
export class RedisProvider {
  public connection: any;

  constructor() {
    const redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'redis',
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
      db: process.env.REDIS_DB || '0',
    });

    this.connection = bluebird.promisifyAll(redisClient);
  }
}
