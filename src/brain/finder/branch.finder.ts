import { promisify } from 'util';

import { ObjectConverter } from '../../helpers/object.converter';
import { RedisManager } from '../redis.manager';

export class BranchFinder {
  public async findAll(): Promise<any> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getClient();

    const getAsync = promisify(redisClient.get).bind(redisClient);
    const keysAsync = promisify(redisClient.keys).bind(redisClient);

    const keys = await keysAsync(`Branch:*`);
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
    const key = `Branch:${code}`;

    return ObjectConverter.underscoreToCamelCase(
      JSON.parse(await getAsync(key)),
    );
  }

  public async findOneByCompanyCodeAndState(
    companyCode: string,
    state: string,
  ): Promise<any> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getClient();
    const getAsync = promisify(redisClient.get).bind(redisClient);
    const key = `Branch_CompanyState:${companyCode}_${state}`;

    return ObjectConverter.underscoreToCamelCase(
      JSON.parse(await getAsync(key)),
    );
  }
}
