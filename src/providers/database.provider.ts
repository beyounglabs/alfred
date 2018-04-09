import { Container, Service } from 'typedi';
import { createConnection, useContainer } from 'typeorm';
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
    let extension = '.js';
    if (['testing'].includes(String(process.env.NODE_ENV))) {
      prefix = '';
      extension = '.ts';
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
          `${__dirname}/../../../../${prefix}src/entities/*.entity{.ts,.js}`,
        ],
        migrations: [
          `${__dirname}/../../../../${prefix}database/migrations/*.{.ts,.js}`,
        ],
        extra: {
          connectionLimit: process.env.DB_POOL_CONNECTION_LIMIT || 10,
        },
      };

      if (process.env.REDIS_CACHE_HOST) {
        connectionOptions.cache = {
          type: 'redis',
          options: {
            host: process.env.REDIS_CACHE_HOST,
            port: process.env.REDIS_CACHE_PORT,
            db: process.env.REDIS_CACHE_DB ? process.env.REDIS_CACHE_DB : 0,
          },
        };
      }

      this.connection = await createConnection(connectionOptions);
    }

    if (process.env.DB_TYPE === 'sqlite') {
      const connectionOptions: any = {
        type: 'sqlite',
        database,
        logging: process.env.DB_LOGGING === 'true',
        logger: 'file',
        entities: [
          `${__dirname}/../../../../${prefix}src/entities/*.entity{.ts,.js}`,
        ],
        migrations: [
          `${__dirname}/../../../../${prefix}database/migrations/*.{.ts,.js}`,
        ],
      };

      this.connection = await createConnection(connectionOptions);
    }

    return this.connection;
  }
}
