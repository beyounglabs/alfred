import { LogDataInterface } from '../contracts/logger.interface';

interface LogDataTransformerInterface extends LogDataInterface {
  level: 'info' | 'warn' | 'error';
}

export function transformer(logData: LogDataTransformerInterface) {
  return {
    '@timestamp': logData.timestamp
      ? logData.timestamp
      : new Date().toISOString(),
    channel: process.env.NODE_ENV,
    message: logData.message,
    severity: logData.level,
    context: logData.meta,
  };
}
