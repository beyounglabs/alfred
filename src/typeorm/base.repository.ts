import { camelCase } from 'lodash';
import {
  FindManyOptions,
  FindOneOptions,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { Cache } from '../cache/cache';

let useCache: boolean = false;
const cache = new Cache();

export class BaseRepository<Entity extends ObjectLiteral> extends Repository<
  Entity
> {
  public setQueryRunner(queryRunner: QueryRunner) {
    Object.assign(this, {
      queryRunner: queryRunner,
      manager: queryRunner.manager,
    });
  }

  public getUseCache() {
    return useCache;
  }

  public setUseCache(uCache: boolean) {
    useCache = uCache;
  }

  protected setCacheOptions(
    options: FindOneOptions<Entity> | FindManyOptions<Entity>,
    cacheKey: string,
    cacheSeconds?: number,
  ): FindOneOptions<Entity> | FindManyOptions<Entity> {
    if (!cacheSeconds) {
      cacheSeconds = 3600;
    }

    if (this.getUseCache()) {
      options.cache = {
        id: cacheKey,
        milliseconds: cacheSeconds * 1000,
      };
    }

    return options;
  }

  protected setCacheQb(
    qb: SelectQueryBuilder<Entity>,
    cacheKey: string,
    cacheSeconds?: number,
  ): SelectQueryBuilder<Entity> {
    if (!cacheSeconds) {
      cacheSeconds = 3600;
    }

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

  protected getCacheKey(props: IArguments): string {
    if (!this.getUseCache()) {
      return '';
    }

    const propList: any[] = [];
    const propsKeys = Object.keys(props);
    propsKeys.forEach(propKey => {
      const value = props[propKey];
      if (!value) {
        propList.push('');
        return;
      }

      if (typeof value === 'object' && value.id) {
        propList.push(value.id);
        return;
      }

      propList.push(value);
    });

    const methodName = this.getCalledMethodName().replace('.', '/');

    const build = process.env.BUILD || '';

    const propsImploded = propList.join('|').replace(/['"]/g, '');

    return `${cache.getHashPrefix()}${methodName}/${propsImploded}:BUILD-${build}`;
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
      entity[camelCase(key)] = data[key];
    }
    return await this.save(entity);
  }

  public async findOne(
    id: any,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity | undefined> {
    if (options?.cache?.id) {
      const cachedResult = await cache.get(options.cache.id);
      if (cachedResult) {
        return cachedResult;
      }
    }

    const result = await super.findOne(id || 0, options);
    if (options?.cache?.id) {
      const cachedResult = await cache.set(
        options.cache.id,
        result,
        options?.cache?.milliseconds / 1000,
      );
    }

    return result;
  }

  public async findOneByIdOrFail(
    id: any,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity> {
    return await this.findOneOrFail(id || 0, options);
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
