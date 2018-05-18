import { camelCase, snakeCase } from 'lodash';
import { QueryRunner } from 'typeorm';
import { ObjectConverter } from '../helpers/object.converter';
import { BaseRepository } from '../typeorm/base.repository';
import { MystiqueActionInterface } from './contracts/mystique.action.interface';
import { MystiqueFieldInterface } from './contracts/mystique.field.interface';

export abstract class AbstractUpserter<
  E extends any,
  R extends BaseRepository<E>
> {
  protected queryRunner: QueryRunner;
  protected repository: R;

  constructor(queryRunner: QueryRunner, repository: R) {
    this.queryRunner = queryRunner;
    this.repository = repository;
  }

  public async upsert(entity: E, data: any): Promise<E> {
    return this.repository.upsert(entity, data);
  }

  protected getResource(): string {
    const resource = snakeCase(
      this.constructor.name.replace('Upserter', ''),
    ).replace(/_/, '-');

    return resource;
  }

  public async search(query: any) {
    const { per_page, current_page } = query;
    const service = String(process.env.BRAIN_SERVICE).toLowerCase();

    const resource = this.getResource();

    query.per_page = !per_page ? 50 : Number(per_page);
    query.current_page = !current_page ? 1 : Number(current_page);

    const total = await this.repository.searchCount(query);

    const attributes = await this.repository.search(query);

    const data = attributes.map(attribute => ({
      ...ObjectConverter.camelCaseToUnderscore(attribute),
      ['__mystique']: {
        actions: <MystiqueActionInterface[]>[
          {
            icon: 'edit',
            label: 'Editar',
            component: {
              path: './pages/Services/Upsert',
              props: {
                params: {
                  id: attribute.id,
                  service,
                  resource,
                },
              },
            },
            props: {},
          },
        ],
      },
    }));

    const from = query.per_page * query.current_page - query.per_page + 1;
    let to = query.per_page * query.current_page;
    if (to > total) {
      to = total;
    }

    return {
      total,
      per_page: query.per_page,
      current_page: query.current_page,
      last_page: Math.ceil(total / query.per_page),
      from,
      to,
      data,
    };
  }

  public async searchForm(fields: MystiqueFieldInterface[]) {
    const service = String(process.env.BRAIN_SERVICE).toLowerCase();
    const resource = this.getResource();
    return {
      actions: <{ [code: string]: MystiqueActionInterface }>{
        ADD: {
          service,
          icon: 'add',
          label: 'Adicionar',
          props: {},
          component: {
            path: './pages/Services/Upsert',
            props: {
              endpoint: `POST:/${resource}/upsert/`,
              params: {
                service,
                resource,
              },
            },
          },
        },
      },
      endpoint: `/mystique/${resource}`,
      fields,
    };
  }

  public async upsertForm(query: any, fields: MystiqueFieldInterface[]) {
    const service = String(process.env.BRAIN_SERVICE).toLowerCase();
    const resource = this.getResource();
    const { id } = query;

    const entity = id
      ? await this.repository.findOneByIdOrFail(query.id)
      : this.repository.create();

    const columnObjects: any = {};
    for (const column of this.repository.metadata.columns) {
      columnObjects[column.propertyName] = column;
    }

    for (const field of fields) {
      field.value = entity[camelCase(field.name)];

      if (
        columnObjects[field.name].transformer &&
        columnObjects[field.name].transformer.constructor.name ===
          'BooleanTransformer'
      ) {
        field.value = field.value ? '1' : '0';
      }
    }

    return {
      actions: <{ [code: string]: MystiqueActionInterface }>{
        SAVE: {
          endpoint: `POST:/${resource}/upsert/`,
          service,
          label: 'Salvar',
          props: {
            id: entity.id,
          },
        },
      },
      fields,
    };
  }
}