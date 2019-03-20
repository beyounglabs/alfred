import { LoggerInterface } from '../logger/contracts/logger.interface';

export function closeAllLoggers(...loggers: LoggerInterface[]): Promise<any> {
  return Promise.all(loggers.map(logger => logger.close()));
}
