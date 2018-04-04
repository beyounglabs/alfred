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
