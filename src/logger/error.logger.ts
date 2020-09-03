import * as winston from 'winston';
import * as SlackHook from 'winston-slack-webhook-transport';
import { LoggerInterface } from './contracts/logger.interface';
import * as Transports from 'winston-transport';

let logger: winston.Logger | null = null;

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

  public getLogger(): winston.Logger {
    if (logger) {
      return logger;
    }

    const transports: Transports[] = [];

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

    const defaultChannel: string =
      process.env.NODE_ENV === 'production' ? 'logger' : 'logger-staging';

    if (slackWebhookUrl) {
      const slackTransport = new SlackHook({
        level: 'error',
        webhookUrl: slackWebhookUrl,
        channel: process.env.SLACK_CHANNEL || defaultChannel,
        iconEmoji: ':shit:',
        username: 'Logger',
        formatter: (info) => {
          const { level, message, ...meta } = info;

          return {
            text: `*${process.env.BRAIN_SERVICE} - ${
              process.env.BRAIN_PROFILE
            } - ${
              process.env.NODE_ENV
            }*\n*Message*: ${message}. \n\n ${JSON.stringify(meta, null, 2)}`,
          };
        },
      });

      transports.push(slackTransport);
    }

    logger = winston.createLogger({
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

      const logger: winston.Logger = this.getLogger();

      logger.error(message, data);
    } catch (e) {
      console.error('[LOGGING_ERROR]:', e.message);
    }
  }

  public async close(): Promise<any> {
    const currentLogger: winston.Logger = this.getLogger();

    logger = null;

    return Promise.resolve(currentLogger.close());
  }
}
