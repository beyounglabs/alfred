import { LoggingWinston } from '@google-cloud/logging-winston';
import { hostname } from 'os';
import * as winston from 'winston';
import { InfoInterface } from './contracts/info.interface';
import {
  LogDataInterface,
  LoggerInterface,
} from './contracts/logger.interface';

let loggers: { [index: string]: winston.Logger | null } = {};

const EXPIRATION_TIME = 3600000;

export class InfoLogger implements LoggerInterface {
  protected data: InfoInterface;

  constructor(data: InfoInterface) {
    if (!data.infoIndex) {
      data.infoIndex = 'default';
    }

    this.data = data;

    setTimeout(() => {
      loggers[this.data.infoIndex!] = null;
    }, EXPIRATION_TIME);
  }

  public getLogger(): winston.Logger {
    if (loggers[this.data.infoIndex!]) {
      return loggers[this.data.infoIndex!]!;
    }

    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS =
        '/var/www/html/gcp-credentials.json';
    }

    const transports: any[] = [];

    const index = [
      this.data.infoIndex,
      String(process.env.BUILD || '000').toLowerCase(),
      // `toISOString` returns date and time separated by 'T',
      // so we remove everything after the 'T'.
      new Date().toISOString().replace(/T.+$/, ''),
    ].join('-');

    transports.push(
      new LoggingWinston({
        level: 'info',
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

    loggers[this.data.infoIndex!] = logger;

    return logger;
  }

  public async log(data: LogDataInterface): Promise<void> {
    try {
      const logger: winston.Logger = this.getLogger();

      const message = data['message'] ? data['message'] : 'log_default';

      if (this.isStatic()) {
        data.content = JSON.stringify(data.content, null, 2);
      }

      logger.info(message, data);
    } catch (e) {
      console.error('[LOGGING_ERROR]:', e.message);
    }
  }

  public isStatic() {
    return this.data.infoIndex!.endsWith('-static');
  }

  public async close(): Promise<any> {
    const logger: winston.Logger = this.getLogger();

    loggers[this.data.infoIndex!] = null;

    return Promise.resolve(logger.close());
  }
}
