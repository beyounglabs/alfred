import { LoggingWinston } from '@google-cloud/logging-winston';
import * as winston from 'winston';
import { ElasticsearchWarnInterface } from './contracts/elasticsearch.warn.interface';
import {
  LogDataInterface,
  LoggerInterface,
} from './contracts/logger.interface';

let loggers: { [index: string]: winston.LoggerInstance } = {};

const EXPIRATION_TIME = 3600000;

export class WarnLogger implements LoggerInterface {
  protected elasticsearch: ElasticsearchWarnInterface;

  constructor(elasticsearch: ElasticsearchWarnInterface) {
    this.elasticsearch = elasticsearch;

    setTimeout(() => {
      loggers[this.elasticsearch.errorIndex] = null;
    }, EXPIRATION_TIME);
  }

  public getLogger(): winston.LoggerInstance {
    if (loggers[this.elasticsearch.errorIndex]) {
      return loggers[this.elasticsearch.errorIndex];
    }

    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS =
        '/var/www/html/gcp-credentials.json';
    }

    const transports: any[] = [];

    const index = [
      this.elasticsearch.errorIndex,
      String(process.env.BUILD || '000').toLowerCase(),
      // `toISOString` returns date and time separated by 'T',
      // so we remove everything after the 'T'.
      new Date().toISOString().replace(/T.+$/, ''),
    ].join('-');

    transports.push(
      new LoggingWinston({
        labels: {
          name: index,
          version: '0.1.0',
        },
      }),
    );

    const logger = new winston.Logger({
      transports,
      exitOnError: false,
    });

    loggers[this.elasticsearch.errorIndex] = logger;

    return logger;
  }

  public async log(data: LogDataInterface) {
    try {
      const logger: winston.LoggerInstance = this.getLogger();

      const message = data['message'] ? data['message'] : 'log_default';

      if (this.isStatic()) {
        data.content = JSON.stringify(data.content, null, 2);
      }

      logger.warn(message, data);
    } catch (e) {
      console.error('[LOGGING_ERROR]:', e.message);
    }
  }

  public isStatic() {
    return this.elasticsearch.errorIndex.endsWith('-static');
  }

  public async close(): Promise<any> {
    const logger: winston.LoggerInstance = this.getLogger();

    loggers[this.elasticsearch.errorIndex] = null;

    return Promise.resolve(logger.close());
  }
}
