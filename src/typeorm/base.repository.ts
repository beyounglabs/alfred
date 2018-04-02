import {
  FindManyOptions,
  FindOneOptions,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

let useCache: boolean = false;

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

    return `repository/${methodName}/${propList.join('|')}`;
  }

  public async findOneByIdOrFail(
    id: any,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity> {
    const entity = await this.findOneById(id, options);

    if (!entity) {
      throw new Error(`Entity ${this.target} not find with Id ${id}`);
    }

    return entity;
  }
}
