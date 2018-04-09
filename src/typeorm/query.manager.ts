import { QueryRunner, getConnection } from 'typeorm';

export class QueryManager {
  protected queryRunner: QueryRunner;

  public getQueryRunner(): QueryRunner {
    if (this.queryRunner) {
      return this.queryRunner;
    }

    this.queryRunner = getConnection().createQueryRunner();
    return this.queryRunner;
  }

  public async startTransaction() {
    await this.getQueryRunner().startTransaction();
  }

  public async commitTransaction() {
    await this.getQueryRunner().commitTransaction();
    await this.release();
  }

  public async rollbackTransaction() {
    if (this.getQueryRunner().isTransactionActive) {
      await this.getQueryRunner().rollbackTransaction();
    }

    await this.release();
  }

  public async release() {
    if (!this.getQueryRunner().isReleased) {
      await this.getQueryRunner().release();
    }
  }
}
