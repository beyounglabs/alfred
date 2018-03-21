import { promisify } from 'util';

import { ObjectConverter } from '../../helpers/object.converter';
import { RedisManager } from '../redis.manager';

export class StoreFinder {
  public async findAll(): Promise<any> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getClient();

    const getAsync = promisify(redisClient.get).bind(redisClient);
    const keysAsync = promisify(redisClient.keys).bind(redisClient);

    const keys = await keysAsync(`Store:*`);
    const items: any[] = [];
    for (const key of keys) {
      items.push(JSON.parse(await getAsync(key)));
    }

    return ObjectConverter.underscoreToCamelCase(items);
  }

  public async findOneByCode(code: string): Promise<any> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getClient();

    const getAsync = promisify(redisClient.get).bind(redisClient);
    const key = `Store:${code}`;

    return ObjectConverter.underscoreToCamelCase(
      JSON.parse(await getAsync(key)),
    );
  }
}
