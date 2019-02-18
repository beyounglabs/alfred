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

type RepositoryType = new (...args: any[]) => any;

type RepositoryListType<T extends RepositoryType[]> = {
  [P in keyof T]: T[P] extends RepositoryType ? InstanceType<T[P]> : never
};

interface GetCustomRepositoriesOptions {
  queryRunner: QueryRunner;
  connectionName?: string;
}

export function getCustomRepositories<T extends RepositoryType[]>(
  options: GetCustomRepositoriesOptions,
  ...customRepositories: T
): RepositoryListType<T> {
  const repositories: T[] = [];

  for (let customRepository of customRepositories) {
    const repository: any = getCustomRepository(
      customRepository,
      options.queryRunner,
      options.connectionName,
    );

    repositories.push(repository);
  }

  return repositories as any;
}
