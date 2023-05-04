import { orderBy } from 'lodash';
import { ObjectConverter } from '../../helpers/object.converter';
import { RedisManager } from '../redis.manager';

export type Branch = {
  id: number;
  code: string;
  companyId: number;
  document: string;
  name: string;
  shortName: string;
  stateCode: number;
  state: string;
  cityCode: number;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  postcode: string;
  complement: string;
  phone: string;
  ie?: string;
  im?: string;
  cnae?: string;
  crt: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  accountingOfficeDocument?: string;
};

export class BranchFinder {
  public async findAll(): Promise<Branch[]> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    let nextCursor: string | null = '0';

    let keys: string[] = [];

    while (nextCursor !== null) {
      const result = await redisClient.scan(
        nextCursor,
        'MATCH',
        `Branch:*`,
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

  public async findActives(): Promise<Branch[]> {
    return (await this.findAll()).filter(item => item.active);
  }

  public async findOneByCode(code: string): Promise<Branch | undefined> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    const key = `Branch:${code}`;

    const result = await redisClient.get(key);
    if (!result) {
      return;
    }

    return ObjectConverter.underscoreToCamelCase(JSON.parse(result));
  }

  public async findOneByCompanyCodeAndState(
    companyCode: string,
    state: string,
  ): Promise<Branch | undefined> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();
    const key = `Branch_CompanyState:${companyCode}_${state}`;

    const result = await redisClient.get(key);
    if (!result) {
      return;
    }

    return ObjectConverter.underscoreToCamelCase(JSON.parse(result));
  }
}
