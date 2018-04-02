import { QueryRunner as TypeORMQueryRunner, getConnection } from 'typeorm';

let queryRunner: TypeORMQueryRunner | undefined;

export class QueryRunner {
  public static async getQueryRunner(): Promise<TypeORMQueryRunner> {
    if (queryRunner) {
      return queryRunner;
    }

    queryRunner = getConnection().createQueryRunner();

    await queryRunner.connect();

    return queryRunner;
  }

  public static async startTransaction(): Promise<void> {
    const qr = await QueryRunner.getQueryRunner();
    await qr.startTransaction();
  }

  public static async commitTransaction(): Promise<void> {
    const qr = await QueryRunner.getQueryRunner();
    await qr.commitTransaction();
  }

  public static async rollbackTransaction(): Promise<void> {
    const qr = await QueryRunner.getQueryRunner();
    await qr.rollbackTransaction();
  }
}
