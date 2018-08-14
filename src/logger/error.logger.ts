import { Slack as WinstonSlack } from 'slack-winston';
import * as winston from 'winston';
import { LoggerInterface } from './contracts/logger.interface';

let logger: winston.LoggerInstance;

export class ErrorLogger implements LoggerInterface {
  public getLogger(): winston.LoggerInstance {
    if (logger) {
      return logger;
    }

    const transports: any[] = [];

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

    const defaultChannel =
      process.env.NODE_ENV === 'production' ? 'logger' : 'logger-staging';

    if (slackWebhookUrl) {
      transports.push(
        new WinstonSlack({
          webhook_url: slackWebhookUrl,
          channel: process.env.SLACK_CHANNEL || defaultChannel,
          level: 'error',
          icon_emoji: ':shit:',
          username: 'Logger',
          message: `*${process.env.BRAIN_SERVICE} - ${
            process.env.BRAIN_PROFILE
          } - ${
            process.env.NODE_ENV
          }*\n*Message*: {{ message }}. \n\n {{ meta }}`,
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

    logger.error(message, data);
  }

  public close() {
    const logger: winston.LoggerInstance = this.getLogger();
    logger.close();
  }
}
