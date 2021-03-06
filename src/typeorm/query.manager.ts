import { getFromContainer } from 'typeorm/container';
import { ConnectionManager } from 'typeorm/connection/ConnectionManager';
import { QueryRunner } from 'typeorm/query-runner/QueryRunner';

export class QueryManager {
  protected queryRunner: QueryRunner | undefined;

  public getQueryRunner(): QueryRunner {
    if (this.queryRunner && !this.queryRunner.isReleased) {
      return this.queryRunner;
    }

    this.queryRunner = getFromContainer(ConnectionManager)
      .get('default')
      .createQueryRunner();

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
    if (!this.queryRunner) {
      return;
    }

    if (!this.getQueryRunner().isReleased) {
      await this.getQueryRunner().release();
      this.queryRunner = undefined;
    }
  }
}
