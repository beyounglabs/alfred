import { camelCase } from 'lodash';
import * as md5 from 'md5';
import {
  FindManyOptions,
  FindOneOptions,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { Cache } from '../cache/cache';

const cache = new Cache();

export class BaseRepository<
  Entity extends ObjectLiteral,
> extends Repository<Entity> {
  protected useCache: boolean = true;

  public setQueryRunner(queryRunner: QueryRunner) {
    Object.assign(this, {
      queryRunner: queryRunner,
      manager: queryRunner.manager,
    });
  }

  public getUseCache() {
    return this.useCache;
  }

  public setUseCache(uCache: boolean) {
    this.useCache = uCache;
  }

  /**
   * @deprecated
   */
  protected setCacheOptions(
    options: FindOneOptions<Entity> | FindManyOptions<Entity>,
    cacheKey: string,
    cacheSeconds?: number,
  ): FindOneOptions<Entity> | FindManyOptions<Entity> {
    if (!cacheSeconds) {
      cacheSeconds = 3600;
    }

    console.info('The setCacheOptions method is deprecated');

    if (this.getUseCache()) {
      options.cache = {
        id: cacheKey,
        milliseconds: cacheSeconds * 1000,
      };
    }

    return options;
  }

  /**
   * @deprecated
   */
  protected setCacheQb(
    qb: SelectQueryBuilder<Entity>,
    cacheKey: string,
    cacheSeconds?: number,
  ): SelectQueryBuilder<Entity> {
    if (!cacheSeconds) {
      cacheSeconds = 3600;
    }

    console.info('The setCacheQb method is deprecated');

    if (this.getUseCache()) {
      qb.cache(cacheKey, cacheSeconds * 1000);
    }

    return qb;
  }

  private getCalledMethodName(): string {
    const stack = new Error().stack;

    let stackMethod = '';
    if (stack) {
      stackMethod = stack.split('\n')[3];
    }
    const regex = /at (.*) \(/;
    const regexResult = regex.exec(stackMethod);

    let methodName = '';
    if (regexResult) {
      methodName = regexResult[1];
    }

    return methodName;
  }

  /**
   * Usage this.getCacheKey(arguments)
   */
  protected getCacheKey(props: IArguments): string {
    if (!this.getUseCache()) {
      return '';
    }

    const propList: any[] = [];
    const propsKeys = Object.keys(props);

    for (const propKey of propsKeys) {
      const value = props[propKey];
      if (!value) {
        propList.push('');
        continue;
      }

      if (typeof value === 'object' && value.id) {
        propList.push(value.id);
        continue;
      }

      propList.push(value);
    }

    const methodName = this.getCalledMethodName().replace('.', '/');

    const build = process.env.BUILD || '';

    const propsMd5 = md5(JSON.stringify(propList));

    return `${cache.getHashPrefix()}ORM_${methodName}/${propsMd5}:BUILD-${build}`;
  }

  public searchQueryBuilder(search: any): SelectQueryBuilder<Entity> {
    const qb = this.createQueryBuilder('e');

    for (const field of Object.keys(search)) {
      const value = search[field];
      const searchField = camelCase(field);
      let whereField = `:${searchField}`;
      let operator = '=';

      if (!value) {
        continue;
      }

      if (!this.metadata.propertiesMap[searchField]) {
        continue;
      }

      if (Array.isArray(value)) {
        operator = 'IN';
        whereField = `(:...${searchField})`;
      }

      qb.andWhere(`e.${searchField} ${operator} ${whereField}`, {
        [searchField]: value,
      });
    }

    qb.orderBy('e.id', 'DESC');

    return qb;
  }

  /**
   * Usage:
   * const cacheKey = this.getCacheKey(arguments);
   * return await this.cached(cacheKey, () => this.find({}));
   */
  public async cached(
    cacheKey: string | null | undefined,
    callback: CallableFunction,
    expireInSeconds?: number,
  ) {
    if (this.getUseCache() && cacheKey) {
      const cachedResult = await cache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }

    const result = await callback();
    if (this.getUseCache() && cacheKey) {
      await cache.set(cacheKey, result, expireInSeconds);
    }

    return result;
  }

  public async searchCount(search: any): Promise<number> {
    const qb = this.searchQueryBuilder(search);
    return await qb.getCount();
  }

  public async search(search: any): Promise<Entity[]> {
    const qb = this.searchQueryBuilder(search);
    this.paginate(qb, search.current_page, search.per_page);
    return await qb.getMany();
  }

  public async upsert(entity: Entity, data: any): Promise<Entity> {
    for (const key of Object.keys(data)) {
      // @ts-ignore
      entity[camelCase(key)] = data[key];
    }
    return await this.save(entity);
  }

  public async findOne(
    id: any,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity | undefined> {
    const optionsCache = options?.cache as any;
    if (optionsCache?.id) {
      const cachedResult = await cache.get(optionsCache.id);
      if (cachedResult) {
        return cachedResult;
      }
    }

    const result = await super.findOne((id as number) || 0, options);
    if (optionsCache?.id) {
      const cachedResult = await cache.set(
        optionsCache.id,
        result,
        optionsCache?.milliseconds / 1000,
      );
    }

    return result;
  }

  public async findOneWithCache(
    id: any,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity | undefined> {
    // @ts-ignore
    const cacheKey = this.getCacheKey(arguments);

    return this.cached(cacheKey, async () => {
      const numberId = Number(id);
      return await super.findOne(numberId || 0, options);
    });
  }

  public async findOneByIdOrFail(
    id: any,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity> {
    const numberId = Number(id);
    return await this.findOneOrFail(numberId || 0, options);
  }

  public async findOneByIdOrFailWithCache(
    id: any,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity> {
    // @ts-ignore
    const cacheKey = this.getCacheKey(arguments);

    return this.cached(cacheKey, async () => {
      const numberId = Number(id);
      return await this.findOneOrFail(numberId || 0, options);
    });
  }

  public paginate(
    qb: SelectQueryBuilder<Entity>,
    page: number,
    limit: number,
  ): SelectQueryBuilder<Entity> {
    qb.offset(page * limit - limit);
    qb.limit(limit);

    return qb;
  }
}
