const dotenv = require('dotenv');

let dotenvPath = '.env';
if (process.env.NODE_ENV === 'testing') {
  dotenvPath = '.env.testing';
}

const prefix = 'dist/';
const extension = '.js';

dotenv.config({ path: dotenvPath });

module.exports = {
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  charset: process.env.DB_CHARSET,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: process.env.DB_LOGGING,
  logger: 'file',
  entities: [prefix + 'src/entities/**/*' + extension],
  migrations: [prefix + 'database/migrations/*' + extension],
  subscribers: [prefix + 'src/subscribers/**/*' + extension],
  cli: {
    entitiesDir: prefix + 'src/entities',
    migrationsDir: prefix + 'database/migrations',
    subscribersDir: prefix + 'src/subscribers',
  },
};
