import { orderBy } from 'lodash';
import { ObjectConverter } from '@beyounglabs/alfred';
import { RedisManager } from '@beyounglabs/alfred-cache';
import { Company } from './company.finder';

export type Store = {
  id: number;
  code: string;
  domain: string;
  name: string;
  companyId: number;
  createdAt: string;
  updatedAt?: string;
  externalCode?: string;
  customerAggregator: string;
  active: number;
  cashbackOwner: string;
  aggregator: string;
  company: Company;
};

export class StoreFinder {
  public async findAll(): Promise<Store[]> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    let nextCursor: string | null = '0';

    let keys: string[] = [];

    while (nextCursor !== null) {
      const result = await redisClient.scan(
        nextCursor,
        'MATCH',
        `Store:*`,
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

  public async findActives(): Promise<Store[]> {
    return (await this.findAll()).filter(item => item.active);
  }

  public async findOneByCode(code: string): Promise<Store | undefined> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    const key = `Store:${code}`;

    const result = await redisClient.get(key);
    if (!result) {
      return;
    }

    return ObjectConverter.underscoreToCamelCase(JSON.parse(result));
  }

  public async findOneByCodeOrFail(code: string): Promise<Store> {
    const store = await this.findOneByCode(code);
    if (!store) {
      throw new Error(`Store ${code} not found`);
    }

    return store;
  }

  public async findOneByDomain(domain: string): Promise<Store | undefined> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    const key = `Store_Domain:${domain}`;

    const result = await redisClient.get(key);
    if (!result) {
      return;
    }

    return ObjectConverter.underscoreToCamelCase(JSON.parse(result));
  }

  public async findOneByDomainOrFail(domain: string): Promise<Store> {
    const store = await this.findOneByDomain(domain);
    if (!store) {
      throw new Error(`Store domain: ${domain} not found`);
    }

    return store;
  }
}
