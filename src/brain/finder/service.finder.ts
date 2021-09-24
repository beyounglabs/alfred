import { orderBy } from 'lodash';
import { promisify } from 'util';
import { ObjectConverter } from '../../helpers/object.converter';
import { RedisManager } from '../redis.manager';

export class ServiceFinder {
  public async findAll(): Promise<any> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    const mgetAsync = promisify(redisClient.mget).bind(redisClient) as any;
    const scanAsync = promisify(redisClient.scan).bind(redisClient) as any;

    let nextCursor: string | null = '0';

    let keys: string[] = [];

    while (nextCursor !== null) {
      const result = await scanAsync([
        nextCursor,
        'MATCH',
        `Service:*`,
        'COUNT',
        5000,
      ]);

      nextCursor = result[0];

      keys = [...keys, ...result[1]];

      if (nextCursor === '0') {
        nextCursor = null;
      }
    }

    const items: any[] = (await mgetAsync(keys)).map(item => JSON.parse(item));

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
    const redisClient = await redisManager.getReadClient();

    const getAsync = promisify(redisClient.get).bind(redisClient);
    const key = `Service:${code}`;

    const result = await getAsync(key);
    if (!result) {
      return;
    }

    return ObjectConverter.underscoreToCamelCase(JSON.parse(result));
  }
}
