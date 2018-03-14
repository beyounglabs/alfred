import { Client } from 'elasticsearch';
import * as winston from 'winston';
import * as WinstonElasticsearch from 'winston-elasticsearch';

import { ElasticsearchInterface } from './contracts/elasticsearch.interface';
import { LoggerInterface } from './contracts/logger.interface';
import { transformer } from './transformers/kibana.transformer';

let logger: winston.LoggerInstance;

export class WarnLogger implements LoggerInterface {
  protected elasticsearch: ElasticsearchInterface;

  constructor(elasticsearch: ElasticsearchInterface) {
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

    logger = new winston.Logger({
      transports,
    });

    return logger;
  }

  public async log(data: any) {
    const logger: winston.LoggerInstance = this.getLogger();

    const message = data['message'] ? data['message'] : 'log_default';
    const logResponse = logger.warn(message, data);
  }
}
