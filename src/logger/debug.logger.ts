import * as winston from 'winston';
import { LoggerInterface } from './contracts/logger.interface';
import { LoggingWinston } from '@google-cloud/logging-winston';

let logger: winston.LoggerInstance;

export class DebugLogger implements LoggerInterface {
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

    transports.push(
      new winston.transports.Console({
        handleExceptions: true,
      })
    );

    logger = new winston.Logger({
      transports,
      exitOnError: false,
    });

    return logger;
  }

  public async log(data: any) {
    const logger: winston.LoggerInstance = this.getLogger();

    const message = data['message'] ? data['message'] : 'log_default';

    logger.info(message, data);
  }

  public close() {
    const logger: winston.LoggerInstance = this.getLogger();
    logger.close();
  }
}
