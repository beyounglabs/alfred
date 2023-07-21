import { orderBy } from 'lodash';
import { ObjectConverter } from '../../helpers/object.converter';
import { RedisManager } from '../redis.manager';
import { Branch } from './branch.finder';

export type Warehouse = {
  id: number;
  code: string;
  name: string;
  shortName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  operatorLogisticCode: string;
  waveConfig?: string;
  branches: Branch[];
};

export class WarehouseFinder {
  public async findAll(): Promise<Warehouse[]> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    let nextCursor: string | null = '0';

    let keys: string[] = [];

    while (nextCursor !== null) {
      const result = await redisClient.scan(
        nextCursor,
        'MATCH',
        `Warehouse:*`,
        'COUNT',
        5000,
      );

      nextCursor = result[0];

      keys = [...keys, ...result[1]];

      if (nextCursor === '0') {
        nextCursor = null;
      }
    }

    const items: any[] = (await redisClient.mget(keys)).map(item =>
      JSON.parse(item!),
    );

    return orderBy(
      ObjectConverter.underscoreToCamelCase(items),
      ['name', 'code'],
      ['asc', 'asc'],
    );
  }

  public async findActives(): Promise<Warehouse[]> {
    return (await this.findAll()).filter(item => item.active);
  }

  public async findOneByCode(code: string): Promise<Warehouse | undefined> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    const key = `Warehouse:${code}`;

    const result = await redisClient.get(key);
    if (!result) {
      return;
    }

    return ObjectConverter.underscoreToCamelCase(JSON.parse(result));
  }

  public async findOneByCodeOrFail(code: string): Promise<Warehouse> {
    const warehouse = await this.findOneByCode(code);
    if (!warehouse) {
      throw new Error(`Warehouse ${code} not found`);
    }

    return warehouse;
  }
}
