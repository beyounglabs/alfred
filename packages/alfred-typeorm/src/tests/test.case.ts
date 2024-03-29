import * as dotenv from 'dotenv';
import { readFile, writeFile } from 'fs/promises';
import { kebabCase } from 'lodash';
import 'reflect-metadata';
import { Container } from 'typedi/Container';
import { Connection } from 'typeorm/connection/Connection';
import { DatabaseProvider } from '../providers/database.provider';
import { FixtureAbstract } from './fixture.abstract';

let executed = true;
if (String(process.env.DATABASE_RELOAD) === '1') {
  executed = false;
}

let dotEnvImported = false;

export class TestCase {
  public loadDotEnv() {
    if (!dotEnvImported) {
      dotenv.config({ path: '.env.testing' });
      dotEnvImported = true;
    }
  }

  public async setup(resetDatabase?: boolean) {
    // @ts-ignore
    if (typeof jest !== 'undefined') {
      // @ts-ignore
      jest.setTimeout(1000 * 60); // 60 seconds
    }

    this.loadDotEnv();

    if (resetDatabase) {
      await this.resetDatabase();
    }
  }

  public async runFixtures(fixtures: string[]) {
    const databaseProvider: DatabaseProvider = Container.get(DatabaseProvider);

    const connection = await databaseProvider.connect();
    const queryRunner = connection.createQueryRunner();

    for (const fixture of fixtures) {
      const fixtureName = kebabCase(fixture).replace(/\-/g, '.');
      const fixtureClass = (
        await import(
          `${__dirname}/../../../../../__tests__/fixtures/${fixtureName}.fixture`
        )
      )[`${fixture}Fixture`];

      const fixtureObjext: FixtureAbstract = new fixtureClass(queryRunner);
      await fixtureObjext.run();
    }
  }

  protected async resetDatabase() {
    if (!executed) {
      const databaseProvider: DatabaseProvider =
        Container.get(DatabaseProvider);
      let databaseName: string = String(process.env.DB_DATABASE);
      if (process.env.DB_TYPE === 'sqlite') {
        databaseName += '.cache';
      }

      let connection: Connection = await databaseProvider.connect(databaseName);

      await connection.createQueryRunner().clearDatabase(databaseName);
      await connection.createQueryRunner().createDatabase(databaseName, true);
      await connection.close();

      connection = await databaseProvider.connect(databaseName);
      await connection.synchronize(false);
      await connection.close();

      executed = true;
    }

    if (process.env.DB_TYPE === 'sqlite') {
      await writeFile(
        String(process.env.DB_DATABASE),
        await readFile(String(process.env.DB_DATABASE) + '.cache'),
      );
    }
  }
}
