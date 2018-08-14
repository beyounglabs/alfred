import { Client } from 'elasticsearch';
import * as winston from 'winston';
import * as WinstonElasticsearch from 'winston-elasticsearch';

import { ElasticsearchWarnInterface } from './contracts/elasticsearch.warn.interface';
import { LoggerInterface } from './contracts/logger.interface';
import { transformer } from './transformers/kibana.transformer';

let logger: winston.LoggerInstance;

export class WarnLogger implements LoggerInterface {
  protected elasticsearch: ElasticsearchWarnInterface;

  constructor(elasticsearch: ElasticsearchWarnInterface) {
    this.elasticsearch = elasticsearch;
  }

  public getLogger(): winston.LoggerInstance {
    if (logger) {
      return logger;
    }

    const transports: any[] = [];

    const esHost = process.env.ELASTICSEARCH_LOG_HOST;
    const esPort = process.env.ELASTICSEARCH_LOG_PORT;

    if (esHost && esPort) {
      const client = new Client({
        host: `${esHost}:${esPort}`,
      });

      transports.push(
        new WinstonElasticsearch({
          name: 'ELASTIC_SEARCH_ERROR',
          level: 'warn',
          client,
          flushInterval: 2000,
          index: this.elasticsearch.errorIndex,
          transformer,
        }),
      );
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

    logger.warn(message, data);
  }

  public close() {
    const logger: winston.LoggerInstance = this.getLogger();
    logger.close();
  }
}
