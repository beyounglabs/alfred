import {
  getCustomRepository as typeORMGetCustomRepository,
  ObjectType,
  EntityManager,
} from 'typeorm';

export function getCustomRepository<T>(
  customRepository: ObjectType<T>,
  entityManager: EntityManager,
  connectionName?: string,
): T {
  const repository: any = typeORMGetCustomRepository(
    customRepository,
    connectionName,
  );

  repository.setEntityManager(entityManager);

  return repository;
}
