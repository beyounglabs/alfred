import { LoggingWinston } from '@google-cloud/logging-winston';
import * as winston from 'winston';
import {
  LogDataInterface,
  LoggerInterface,
} from './contracts/logger.interface';
import { hostname } from 'os';
import { ErrorInterface } from './contracts/error.interface';
import { stat } from 'fs/promises';

let loggers: { [index: string]: winston.Logger | null } = {};

const EXPIRATION_TIME = 3600000;

/**
 * @depracated
 */
export class ErrorLogger implements LoggerInterface {
  protected data: ErrorInterface;

  constructor(data?: ErrorInterface) {
    this.data = data ?? {
      errorIndex: 'default',
    };

    if (!this.data.errorIndex) {
      this.data.errorIndex = 'default';
    }

    setTimeout(() => {
      loggers[this.data.errorIndex!] = null;
    }, EXPIRATION_TIME);
  }

  public async getLogger(): Promise<winston.Logger> {
    if (loggers[this.data.errorIndex!]) {
      return loggers[this.data.errorIndex!]!;
    }

    const fileExists = await stat('/var/www/html/gcp-credentials.json')
      .then(() => true)
      .catch(() => false);

    if (fileExists && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS =
        '/var/www/html/gcp-credentials.json';
    }

    const transports: any[] = [];

    const index = [
      this.data.errorIndex,
      String(process.env.BUILD || '000').toLowerCase(),
      // `toISOString` returns date and time separated by 'T',
      // so we remove everything after the 'T'.
      new Date().toISOString().replace(/T.+$/, ''),
    ].join('-');

    transports.push(
      new LoggingWinston({
        level: 'warn',
        labels: {
          index,
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

    loggers[this.data.errorIndex!] = logger;

    return logger;
  }

  public async log(data: LogDataInterface): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'testing') {
        console.error(data);
        return;
      }

      const logger: winston.Logger = await this.getLogger();

      if (process.env.NODE_ENV === 'development') {
        console.error(data);
      }

      const message = data['message'] ? data['message'] : 'log_default';

      if (this.isStatic()) {
        data.content = JSON.stringify(data.content, null, 2);
      }

      logger.error(message, data);
    } catch (e) {
      console.error('[LOGGING_ERROR]:', e.message);
    }
  }

  public isStatic() {
    return this.data.errorIndex!.endsWith('-static');
  }

  public async close(): Promise<any> {
    const logger: winston.Logger = await this.getLogger();

    loggers[this.data.errorIndex!] = null;

    return Promise.resolve(logger.close());
  }
}
