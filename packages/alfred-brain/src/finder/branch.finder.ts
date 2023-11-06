import { orderBy } from 'lodash';
import { ObjectConverter } from '@beyounglabs/alfred';
import { RedisManager } from '@beyounglabs/alfred-cache';
import { Warehouse } from './warehouse.finder';
import { Company } from './company.finder';

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
  freightCode?: string;
  stockCode?: string;
  company: Company;
  warehouses: Warehouse[];
  orderTypes?: string[];
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
      items.map(item => this.formatBranch(item)),
      ['name', 'code'],
      ['asc', 'asc'],
    );
  }

  public async findActives(): Promise<Branch[]> {
    return (await this.findAll()).filter(item => item.active);
  }

  public async findByFreightCode(freightCode: string): Promise<Branch[]> {
    if (!freightCode) {
      return [];
    }

    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    const key = `Branch_FreightCode:${freightCode}`;

    const result = await redisClient.get(key);
    if (!result) {
      return [];
    }

    return orderBy(
      JSON.parse(result).map((item: any) => this.formatBranch(item)),
      ['name', 'code'],
      ['asc', 'asc'],
    );
  }

  public async findOneByCode(code: string): Promise<Branch | undefined> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getReadClient();

    const key = `Branch:${code}`;

    const result = await redisClient.get(key);
    if (!result) {
      return;
    }

    return this.formatBranch(JSON.parse(result));
  }

  public async findOneByCodeOrFail(code: string): Promise<Branch> {
    const branch = await this.findOneByCode(code);
    if (!branch) {
      throw new Error(`Branch ${code} not found`);
    }

    return branch;
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

    return this.formatBranch(JSON.parse(result));
  }

  public async findOneByCompanyCodeAndStateOrFail(
    companyCode: string,
    state: string,
  ): Promise<Branch> {
    const branch = await this.findOneByCompanyCodeAndState(companyCode, state);
    if (!branch) {
      throw new Error(`Branch company:${companyCode} state:${state} not found`);
    }

    return branch;
  }

  protected formatBranch(branch: any): Branch | undefined {
    if (!branch) {
      return;
    }

    let branchFormatted = ObjectConverter.underscoreToCamelCase(branch);
    if (
      branchFormatted.orderTypes &&
      typeof branchFormatted.orderTypes === 'string'
    ) {
      branchFormatted.orderTypes = JSON.parse(branchFormatted.orderTypes);
    }

    return branchFormatted;
  }
}
