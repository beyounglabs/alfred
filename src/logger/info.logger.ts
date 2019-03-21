import { Client } from 'elasticsearch';
import * as winston from 'winston';
import * as WinstonElasticsearch from 'winston-elasticsearch';
import { ElasticsearchInfoInterface } from './contracts/elasticsearch.info.interface';
import {
  LoggerInterface,
  LogDataInterface,
} from './contracts/logger.interface';
import { transformer } from './transformers/kibana.transformer';

let loggers: { [index: string]: winston.LoggerInstance } = {};

const EXPIRATION_TIME = 3600000;

export class InfoLogger implements LoggerInterface {
  protected elasticsearch: ElasticsearchInfoInterface;

  constructor(elasticsearch: ElasticsearchInfoInterface) {
    this.elasticsearch = elasticsearch;

    setTimeout(() => {
      loggers[this.elasticsearch.infoIndex] = null;
    }, EXPIRATION_TIME);
  }

  public getLogger(): winston.LoggerInstance {
    if (loggers[this.elasticsearch.infoIndex]) {
      return loggers[this.elasticsearch.infoIndex];
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
          name: 'ELASTIC_SEARCH_INFO',
          level: 'info',
          client,
          flushInterval: 2000,
          index: this.elasticsearch.infoIndex,
          transformer,
        }),
      );
    }

    const logger = new winston.Logger({
      transports,
      exitOnError: false,
    });

    loggers[this.elasticsearch.infoIndex] = logger;

    return logger;
  }

  public async log(data: LogDataInterface) {
    const logger: winston.LoggerInstance = this.getLogger();

    const message = data['message'] ? data['message'] : 'log_default';

    if (this.isStatic()) {
      data.meta = JSON.stringify(data.meta, null, 2);
    }

    logger.info(message, data);
  }

  public isStatic() {
    return this.elasticsearch.infoIndex.endsWith('-static');
  }

  public async close(): Promise<any> {
    const logger: winston.LoggerInstance = this.getLogger();

    return Promise.resolve(logger.close());
  }
}
