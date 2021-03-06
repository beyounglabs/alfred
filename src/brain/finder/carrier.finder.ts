import { orderBy } from 'lodash';
import { promisify } from 'util';
import { ObjectConverter } from '../../helpers/object.converter';
import { RedisManager } from '../redis.manager';

export class CarrierFinder {
  public async findAll(): Promise<any> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getClient();

    const getAsync = promisify(redisClient.get).bind(redisClient);
    const keysAsync = promisify(redisClient.keys).bind(redisClient);

    const keys = await keysAsync(`Carrier:*`);
    const items: any[] = [];
    for (const key of keys) {
      items.push(JSON.parse(await getAsync(key)));
    }

    return orderBy(
      ObjectConverter.underscoreToCamelCase(items),
      ['name', 'code'],
      ['asc', 'asc'],
    );
  }

  public async findActives(): Promise<any> {
    return (await this.findAll()).filter(item => item.active);
  }

  public async findOneByCode(code: string): Promise<any> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getClient();

    const getAsync = promisify(redisClient.get).bind(redisClient);
    const key = `Carrier:${code}`;

    const result = await getAsync(key);
    if (!result) {
      return;
    }

    return ObjectConverter.underscoreToCamelCase(JSON.parse(result));
  }
}
