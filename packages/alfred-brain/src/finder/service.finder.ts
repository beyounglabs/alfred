import { orderBy } from 'lodash';
import { ObjectConverter } from '@beyounglabs/alfred';
import { RedisManager } from '@beyounglabs/alfred-cache';

export interface Service {
  id: number;
  code: string;
  name: string;
  active: number;
  createdAt: string;
  updatedAt?: string;
}

export class ServiceFinder {
  public async findAll(): Promise<Service[]> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    let nextCursor: string | null = '0';

    let keys: string[] = [];

    while (nextCursor !== null) {
      const result = await redisClient.scan(
        nextCursor,
        'MATCH',
        `Service:*`,
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

  public async findActives(): Promise<Service[]> {
    return (await this.findAll()).filter(item => item.active);
  }

  public async findOneByCode(code: string): Promise<Service | undefined> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    const key = `Service:${code}`;

    const result = await redisClient.get(key);
    if (!result) {
      return;
    }

    return ObjectConverter.underscoreToCamelCase(JSON.parse(result));
  }

  public async findOneByCodeOrFail(code: string): Promise<Service> {
    const service = await this.findOneByCode(code);
    if (!service) {
      throw new Error(`Service ${code} not found`);
    }

    return service;
  }
}
