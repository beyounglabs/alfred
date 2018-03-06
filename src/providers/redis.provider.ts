import { Service } from 'typedi';
import * as bluebird from 'bluebird';
import * as redis from 'redis';

@Service('redis.provider')
export class RedisProvider {
  public connection: any;

  constructor() {
    const redisClient = redis.createClient({
      host: 'redis',
    });

    this.connection = bluebird.promisifyAll(redisClient);
  }
}
