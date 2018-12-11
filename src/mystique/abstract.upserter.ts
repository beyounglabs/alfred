import { camelCase, kebabCase, snakeCase } from 'lodash';
import * as moment from 'moment';
import { EntityMetadata, getConnection, QueryRunner } from 'typeorm';
import { ObjectConverter } from '../helpers/object.converter';
import { BaseRepository } from '../typeorm/base.repository';
import { MystiqueActionInterface } from './contracts/mystique.action.interface';
import { MystiqueActionsType } from './contracts/mystique.actions.type';
import { MystiqueFieldInterface } from './contracts/mystique.field.interface';
import { MystiqueSearchConfigInterface } from './contracts/mystique.search.config.interface';

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

  protected getService(): string {
    const service = String(process.env.BRAIN_SERVICE).toLowerCase();

    return service;
  }

  protected getDefaultActions(entity: E): MystiqueActionsType {
    const service = this.getService();
    const resource = this.getResource();

    return {
      EDIT: {
        icon: 'edit',
        label: 'Editar',
        component: {
          path: './pages/Services/Upsert',
          props: {
            params: {
              id: entity.id,
              service,
              resource,
            },
          },
        },
        props: {},
      },
      DELETE: {
        icon: 'delete',
        label: 'Apagar',
        component: {
          path: './pages/Services/Delete',
          props: {
            params: {
              id: entity.id,
              service,
              resource,
            },
          },
        },
        props: {},
      },
    };
  }

  protected mergeActionsToArray(
    ...allActions: MystiqueActionsType[]
  ): MystiqueActionsType {
    const mergedActions: MystiqueActionsType = {};

    for (let actions of allActions) {
      for (let actionCode in actions) {
        if (!mergedActions[actionCode]) {
          mergedActions[actionCode] = {};
        }

        Object.assign(mergedActions[actionCode], actions[actionCode]);
      }
    }

    return mergedActions;
  }

  public async search(query: any, config?: MystiqueSearchConfigInterface<E>) {
    const { per_page, current_page } = query;

    query.per_page = !per_page ? 50 : Number(per_page);
    query.current_page = !current_page ? 1 : Number(current_page);

    const total = await this.repository.searchCount(query);

    const entities = await this.repository.search(query);

    const data = entities.map(entity => {
      let actions = this.getDefaultActions(entity);

      if (config !== undefined && config.getActions) {
        const receivedActions = config.getActions(entity);
        actions = this.mergeActionsToArray(actions, receivedActions);
      }

      return {
        ...ObjectConverter.camelCaseToUnderscore(entity),
        __mystique: {
          actions,
        },
      };
    });

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
    const service = this.getService();
    const resource = this.getResource();

    return {
      actions: <MystiqueActionsType>{
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

  public async findOneToUpsertForm(id: number | undefined): Promise<E> {
    return id
      ? await this.repository.findOneByIdOrFail(id)
      : this.repository.create();
  }

  public async upsertForm(query: any, fields: MystiqueFieldInterface[]) {
    const service = this.getService();
    const resource = this.getResource();
    const connection = getConnection();

    const entity = await this.findOneToUpsertForm(query.id);

    const entityMetadata = connection.getMetadata(entity.constructor);

    const columnObjects: any = {};
    for (const column of this.repository.metadata.columns) {
      columnObjects[column.propertyName] = column;
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
      fields: await this.transformFields(
        fields,
        entity,
        entityMetadata,
        columnObjects,
      ),
    };
  }

  protected async transformFields(
    fields: MystiqueFieldInterface[],
    entity: E,
    entityMetadata: EntityMetadata,
    columnObjects: any,
  ) {
    const transformedFields = [...fields];

    for (const field of transformedFields) {
      const entityName = camelCase(field.name);
      field.value = entity[entityName];

      if (
        columnObjects[entityName] &&
        columnObjects[entityName].transformer &&
        columnObjects[entityName].transformer.constructor.name ===
          'BooleanTransformer'
      ) {
        field.value = field.value ? '1' : '0';
      }

      if (Array.isArray(field.value)) {
        field.value = field.value.map(item => {
          if (item.id) {
            return item.id;
          }

          return item;
        });
      }

      const isDate = field.value instanceof Date;

      if (
        !Array.isArray(field.value) &&
        field.value !== null &&
        !isDate &&
        typeof field.value === 'object'
      ) {
        field.value = JSON.stringify(field.value, null, 2);
      }

      if (field.type.startsWith('datetime')) {
        field.type = 'datetime-local';
        field.value = field.value
          ? moment(field.value).format('YYYY-MM-DDTHH:mm')
          : null;
      }

      if (field.type === 'date') {
        field.value = field.value
          ? moment(field.value).format('YYYY-MM-DD')
          : null;
      }

      if (field.type === 'group' || field.type === 'tab') {
        field.fields = field.fields
          ? await this.transformFields(
              field.fields,
              entity,
              entityMetadata,
              columnObjects,
            )
          : [];
      }

      if (field.type === 'relation') {
        const relation = entityMetadata.relations.find(
          relation => relation.inverseEntityMetadata.name === field.entityName,
        );

        field.value = null;
        field.resource = kebabCase(field.entityName);

        if (!relation) {
          continue;
        }

        field.value = ObjectConverter.camelCaseToUnderscore(
          await entity[relation.propertyPath],
        );
      }
    }

    return transformedFields;
  }
}
