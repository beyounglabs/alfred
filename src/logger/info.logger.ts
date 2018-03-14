import { Client } from 'elasticsearch';
import { Slack as WinstonSlack } from 'slack-winston';
import * as winston from 'winston';
import * as WinstonElasticsearch from 'winston-elasticsearch';

import { ElasticsearchInfoInterface } from './contracts/elasticsearch.info.interface';
import { LoggerInterface } from './contracts/logger.interface';
import { SlackInterface } from './contracts/slack.interface';
import { transformer } from './transformers/kibana.transformer';

let logger: winston.LoggerInstance;

export class InfoLogger implements LoggerInterface {
  protected elasticsearch: ElasticsearchInfoInterface;

  constructor(elasticsearch: ElasticsearchInfoInterface) {
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
          name: 'ELASTIC_SEARCH_INFO',
          level: 'info',
          client,
          flushInterval: 2000,
          index: this.elasticsearch.infoIndex,
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

    logger.info(message, data);
  }
}
