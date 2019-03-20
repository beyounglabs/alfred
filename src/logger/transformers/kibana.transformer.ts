export interface LogDataInterface {
  timestamp?: string;
  uniqId: string | number;
  message: string;
  content: any;
  [key: string]: any;
}

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
    context: logData,
  };
}
