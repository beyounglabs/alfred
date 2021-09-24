import { QueryRunner } from 'typeorm/query-runner/QueryRunner';

export abstract class FixtureAbstract {
  protected queryRunner: QueryRunner;

  public getQueryRunner(): QueryRunner {
    return this.queryRunner;
  }

  public constructor(queryRunner: QueryRunner) {
    this.queryRunner = queryRunner;
  }

  public abstract run(): Promise<void>;
}
