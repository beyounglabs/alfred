import { Slack as WinstonSlack } from 'slack-winston';
import * as winston from 'winston';

import { LoggerInterface } from './contracts/logger.interface';
import { SlackInterface } from './contracts/slack.interface';

let logger: winston.LoggerInstance;

export class ErrorLogger implements LoggerInterface {
  protected slack: SlackInterface;

  constructor(slack: SlackInterface) {
    this.slack = slack;
  }

  public getLogger(): winston.LoggerInstance {
    if (logger) {
      return logger;
    }

    const transports: any[] = [];

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

    logger = new winston.Logger({
      transports,
    });

    return logger;
  }

  public async log(data: any) {
    const logger: winston.LoggerInstance = this.getLogger();
    const message = data['message'] ? data['message'] : 'log_default';
    const logResponse = logger.error(message, data);
  }
}
