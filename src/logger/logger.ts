import { Client } from 'elasticsearch';
import { Slack as WinstonSlack } from 'slack-winston';
import * as winston from 'winston';
import * as WinstonElasticsearch from 'winston-elasticsearch';

import { SlackInterface } from './contracts/slack.interface';
import { ElasticsearchInterface } from './contracts/elasticsearch.interface';
import { transformer } from './transformers/kibana.transformer';

let logger: winston.LoggerInstance;

export class Logger {
  protected slack: SlackInterface;
  protected elasticsearch: ElasticsearchInterface;

  constructor(slack: SlackInterface, elasticsearch: ElasticsearchInterface) {
    this.slack = slack;
    this.elasticsearch = elasticsearch;
  }

  public getLogger(): winston.LoggerInstance {
    if (logger) {
      return logger;
    }

    const transports: any[] = [];

    const esHost = process.env.ELASTICSEARCH_LOG_HOST;
    const esPort = process.env.ELASTICSEARCH_LOG_PORT;
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (slackWebhookUrl) {
      transports.push(
        new WinstonSlack({
          webhook_url: slackWebhookUrl,
          channel: this.slack.channel,
          level: 'error',
          icon_emoji: ':shit:',
          username: 'Logger',
          message: `*${this.slack.system} - ${
            process.env.NODE_ENV
          }*\n*Message*: {{ message }}. \n\n {{ meta }}`,
        }),
      );
    }

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
  public async log(level: string, data: any) {
    const logger: winston.LoggerInstance = this.getLogger();

    const message = data['message'] ? data['message'] : 'log_default';
    const logResponse = logger[level](message, data);
  }
}
