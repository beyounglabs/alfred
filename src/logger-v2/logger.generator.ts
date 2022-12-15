import { hostname } from 'os';
import * as winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';
import { LoggerDataInterface } from './logger.data.interface';
import { LoggerLevelType } from './logger.level.type';
import { stat } from 'fs/promises';

let loggerLevel: LoggerLevelType = 'notice';
let logger: winston.Logger | undefined = undefined;

export abstract class LoggerGenerator {
  public static async log(
    level: LoggerLevelType,
    data: LoggerDataInterface,
  ): Promise<void> {
    try {
      if (data.isAxiosError) {
        data = data.toJSON();
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(JSON.stringify(data, null, 2));
      }

      logger = await this.getLogger();

      const message = data.message;

      // @ts-ignore
      delete data.message;

      logger.log(level, message, data);
    } catch (e) {
      console.error('[LOGGING_ERROR]:', e.message);
    }
  }

  public static async getLogger(): Promise<winston.Logger> {
    const loggingLevel = (process.env.LOGGING_LEVEL ??
      loggerLevel) as LoggerLevelType;

    if (logger && loggingLevel === loggerLevel) {
      return logger;
    }

    const fileExists = await stat('/var/www/html/gcp-credentials.json')
      .then(() => true)
      .catch(() => false);

    if (fileExists && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS =
        '/var/www/html/gcp-credentials.json';
    }

    const transports: any[] = [];

    const index = [
      String(process.env.BUILD || '000').toLowerCase(),
      new Date().toISOString().replace(/T.+$/, ''),
    ].join('-');

    if (!Object.keys(winston.config.syslog.levels).includes(loggingLevel)) {
      console.error(`[LOGGING_ERROR]: Invalid LOGGING_LEVEL ${loggingLevel}`);
    }

    loggerLevel = loggingLevel;

    transports.push(
      new LoggingWinston({
        level: loggingLevel,
        levels: winston.config.syslog.levels,
        labels: {
          index,
          build: process.env.BUILD || '',
          env: process.env.NODE_ENV || '',
          service: process.env.BRAIN_SERVICE || '',
          profile: process.env.BRAIN_PROFILE || '',
          hostname: hostname(),
          pid: process.pid.toString(),
        },
      }),
    );

    return winston.createLogger({
      transports,
      exitOnError: false,
      levels: winston.config.syslog.levels,
    });
  }
}
