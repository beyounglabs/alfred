import { Dictionary, lowerFirst } from 'lodash';
import {
  getCustomRepository as typeORMGetCustomRepository,
  ObjectType,
  QueryRunner,
} from 'typeorm';

export function getCustomRepository<T>(
  customRepository: ObjectType<T>,
  queryRunner: QueryRunner,
  connectionName?: string,
): T {
  const repository: any = typeORMGetCustomRepository(
    customRepository,
    connectionName,
  );

  repository.setQueryRunner(queryRunner);

  return repository;
}

export function getCustomRepositories<T>(
  customRepositories: ObjectType<T>[],
  queryRunner: QueryRunner,
  connectionName?: string,
): Dictionary<T> {
  const repositories: Dictionary<T> = {};

  for (let customRepository of customRepositories) {
    const repositoryName = lowerFirst(customRepository.name);

    const repository: any = getCustomRepository(
      customRepository,
      queryRunner,
      connectionName,
    );

    repositories[repositoryName] = repository;
  }

  return repositories;
}
