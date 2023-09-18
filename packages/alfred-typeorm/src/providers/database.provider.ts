import { Container, Service } from 'typedi';
import { createConnection, useContainer } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Connection } from 'typeorm/connection/Connection';

@Service('database.provider')
export class DatabaseProvider {
  public connection: Connection;

  constructor() {
    useContainer(Container);
  }

  public async close(): Promise<void> {
    if (!this.connection) {
      return;
    }

    if (!this.connection.isConnected) {
      return;
    }

    await this.connection.close();
  }

  public async connect(databaseName?: string): Promise<Connection> {
    if (this.connection && this.connection.isConnected) {
      return this.connection;
    }

    let prefix = 'dist/';

    if (['testing'].indexOf(String(process.env.NODE_ENV)) !== -1) {
      prefix = '';
    }

    let database = process.env.DB_DATABASE;
    if (databaseName) {
      database = databaseName;
    } else if (databaseName === '') {
      database = undefined;
    }

    if (process.env.DB_TYPE === 'mysql') {
      const connectionOptions: any = {
        type: 'mysql',
        host: process.env.DB_HOST,
        charset: process.env.DB_CHARSET,
        port: parseInt(String(process.env.DB_PORT), 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database,
        logging: process.env.DB_LOGGING === 'true',
        logger: 'file',
        cache: false,
        entities: [
          `${__dirname}/../../../../../${prefix}src/entities/*.entity{.ts,.js}`,
        ],
        migrations: [
          `${__dirname}/../../../../../${prefix}database/migrations/*.{.ts,.js}`,
        ],
        extra: {
          connectionLimit: process.env.DB_POOL_CONNECTION_LIMIT || 10,
        },
        namingStrategy: new SnakeNamingStrategy(),

        flags: ['+LOCAL_FILES'],
      };

      this.connection = await createConnection(connectionOptions);
    } else if (process.env.DB_TYPE === 'postgres') {
      const connectionOptions: any = {
        type: 'postgres',
        host: process.env.DB_HOST,
        charset: process.env.DB_CHARSET,
        port: parseInt(String(process.env.DB_PORT), 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database,
        logging: process.env.DB_LOGGING === 'true',
        logger: 'file',
        cache: false,
        entities: [
          `${__dirname}/../../../../../${prefix}src/entities/*.entity{.ts,.js}`,
        ],
        migrations: [
          `${__dirname}/../../../../../${prefix}database/migrations/*.{.ts,.js}`,
        ],
        extra: {
          connectionLimit: process.env.DB_POOL_CONNECTION_LIMIT || 10,
        },
        namingStrategy: new SnakeNamingStrategy(),
      };

      this.connection = await createConnection(connectionOptions);
    } else if (process.env.DB_TYPE === 'sqlite') {
      const connectionOptions: any = {
        type: 'sqlite',
        database,
        logging: process.env.DB_LOGGING === 'true',
        logger: 'file',
        entities: [
          `${__dirname}/../../../../../${prefix}src/entities/*.entity{.ts,.js}`,
        ],
        migrations: [
          `${__dirname}/../../../../../${prefix}database/migrations/*.{.ts,.js}`,
        ],
      };

      this.connection = await createConnection(connectionOptions);
    }

    return this.connection;
  }
}
