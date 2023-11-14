import { orderBy } from 'lodash';
import { ObjectConverter } from '@beyounglabs/alfred';
import { RedisManager } from '@beyounglabs/alfred-cache';

export type Carrier = {
  id: number;
  code: string;
  name: string;
  document: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  postcode: string;
  complement: string;
  phone?: string;
  ie: string;
  active: number;
  createdAt: string;
  updatedAt: string;
  shortName: string;
  labelAlias: string;
  freightTaxId: number;
  pickup?: boolean;
};

export class CarrierFinder {
  public async findAll(): Promise<Carrier[]> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    let nextCursor: string | null = '0';

    let keys: string[] = [];

    while (nextCursor !== null) {
      const result = await redisClient.scan(
        nextCursor,
        'MATCH',
        `Carrier:*`,
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

  public async findActives(): Promise<Carrier[]> {
    return (await this.findAll()).filter(item => item.active);
  }

  public async findOneByCode(code: string): Promise<Carrier | undefined> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    const key = `Carrier:${code}`;

    const result = await redisClient.get(key);
    if (!result) {
      return;
    }

    return ObjectConverter.underscoreToCamelCase(JSON.parse(result));
  }

  public async findOneByCodeOrFail(code: string): Promise<Carrier> {
    const carrier = await this.findOneByCode(code);
    if (!carrier) {
      throw new Error(`Carrier ${code} not found`);
    }

    return carrier;
  }
}
