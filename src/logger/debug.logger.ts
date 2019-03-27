import * as winston from 'winston';
import { LoggerInterface } from './contracts/logger.interface';
import { LoggingWinston } from '@google-cloud/logging-winston';

let logger: winston.LoggerInstance;

const EXPIRATION_TIME = 3600000;

export class DebugLogger implements LoggerInterface {
  constructor() {
    this.expireCache();
  }

  protected expireCache() {
    setTimeout(() => {
      logger = null;

      this.expireCache();
    }, EXPIRATION_TIME);
  }

  public getLogger(): winston.LoggerInstance {
    if (logger) {
      return logger;
    }

    const transports: any[] = [];
    if (
      process.env.GCP_LOGGER_PROJECT_ID &&
      process.env.GCP_LOGGER_KEY_FILENAME
    ) {
      transports.push(
        new LoggingWinston({
          projectId: process.env.GCP_LOGGER_PROJECT_ID,
          keyFilename: process.env.GCP_LOGGER_KEY_FILENAME,
        }),
      );
    } else {
      transports.push(new winston.transports.Console());
    }

    logger = new winston.Logger({
      transports,
      exitOnError: false,
    });

    return logger;
  }

  public async log(data: any) {
    try {
      const logger: winston.LoggerInstance = this.getLogger();

      const message = data['message'] ? data['message'] : 'log_default';

      logger.info(message, data);
    } catch (e) {
      console.error('[LOGGING_ERROR]:', e.message);
    }
  }

  public async close(): Promise<any> {
    const logger: winston.LoggerInstance = this.getLogger();

    return Promise.resolve(logger.close());
  }
}
