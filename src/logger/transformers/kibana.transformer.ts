export interface LogDataInterface {
  timestamp?: string;
  uniqId?: string | number;
  message: string;
  level: 'info' | 'warn' | 'error';
  content: any;
}

export function transformer(logData: LogDataInterface) {
  return {
    '@timestamp': logData.timestamp
      ? logData.timestamp
      : new Date().toISOString(),
    channel: process.env.NODE_ENV,
    message: logData.message,
    severity: logData.level,
    context: {
      content: logData.content,
      message: logData.message,
      uniqId: logData.uniqId,
    },
  };
}
