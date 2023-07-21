import { LoggingWinston } from '@google-cloud/logging-winston';
import * as winston from 'winston';
import { LoggerInterface } from './contracts/logger.interface';

let logger: winston.Logger | null;

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

  public getLogger(): winston.Logger {
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

    logger = winston.createLogger({
      transports,
      exitOnError: false,
    });

    return logger;
  }

  public async log(data: any): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'testing') {
        console.debug(data);
        return;
      }

      const logger: winston.Logger = this.getLogger();

      const message = data['message'] ? data['message'] : 'log_default';

      logger.info(message, data);
    } catch (e) {
      console.error('[LOGGING_ERROR]:', e.message);
    }
  }

  public async close(): Promise<any> {
    const logger: winston.Logger = this.getLogger();
    return Promise.resolve(logger.close());
  }
}