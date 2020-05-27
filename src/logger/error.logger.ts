import { Slack as WinstonSlack } from 'slack-winston';
import * as winston from 'winston';
import { LoggerInterface } from './contracts/logger.interface';

let logger: winston.LoggerInterface | null = null;

const EXPIRATION_TIME = 3600000;

export class ErrorLogger implements LoggerInterface {
  constructor() {
    this.expireCache();
  }

  protected expireCache() {
    setTimeout(() => {
      logger = null;

      this.expireCache();
    }, EXPIRATION_TIME);
  }

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
          message: `*${process.env.BRAIN_SERVICE} - ${process.env.BRAIN_PROFILE} - ${process.env.NODE_ENV}*\n*Message*: {{ message }}. \n\n {{ meta }}`,
        }),
      );
    }

    logger = new winston.Logger({
      transports,
      exitOnError: false,
    });

    return logger;
  }

  public async log(data: any): Promise<void> {
    try {
      const message = data['message'] ? data['message'] : 'log_default';
      if (process.env.NODE_ENV === 'development') {
        console.error(message, data);
        return;
      }

      const logger: winston.LoggerInstance = this.getLogger();

      logger.error(message, data);
    } catch (e) {
      console.error('[LOGGING_ERROR]:', e.message);
    }
  }

  public async close(): Promise<any> {
    const currentLogger: winston.LoggerInstance = this.getLogger();

    logger = null;

    return Promise.resolve(currentLogger.close());
  }
}
