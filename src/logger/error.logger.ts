import { LoggingWinston } from '@google-cloud/logging-winston';
import * as winston from 'winston';
import {
  LogDataInterface,
  LoggerInterface,
} from './contracts/logger.interface';
import { hostname } from 'os';

let loggerInstance: winston.Logger | null = null;

const EXPIRATION_TIME = 3600000;

export class ErrorLogger implements LoggerInterface {
  constructor() {
    setTimeout(() => {
      loggerInstance = null;
    }, EXPIRATION_TIME);
  }

  public getLogger(): winston.Logger {
    if (loggerInstance) {
      return loggerInstance!;
    }

    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS =
        '/var/www/html/gcp-credentials.json';
    }

    const transports: any[] = [];

    transports.push(
      new LoggingWinston({
        level: 'error',
        labels: {
          build: process.env.BUILD || '',
          env: process.env.NODE_ENV || '',
          service: process.env.BRAIN_SERVICE || '',
          profile: process.env.BRAIN_PROFILE || '',
          hostname: hostname(),
          pid: process.pid.toString(),
        },
      }),
    );

    const logger = winston.createLogger({
      transports,
      exitOnError: false,
    });

    loggerInstance = logger;

    return loggerInstance;
  }

  public async log(data: LogDataInterface): Promise<void> {
    try {
      const logger: winston.Logger = this.getLogger();

      const message = data['message'] ? data['message'] : 'log_default';

      data.content = JSON.stringify(data.content, null, 2);

      logger.warn(message, data);
    } catch (e) {
      console.error('[LOGGING_ERROR]:', e.message);
    }
  }

  public async close(): Promise<any> {
    const logger: winston.Logger = this.getLogger();

    loggerInstance = null;

    return Promise.resolve(logger.close());
  }
}
