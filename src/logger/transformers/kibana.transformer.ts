export function transformer(logData) {
  return {
    '@timestamp': logData.timestamp
      ? logData.timestamp
      : new Date().toISOString(),
    channel: process.env.NODE_ENV,
    message: logData.message,
    severity: logData.level,
    context: {
      ...logData.meta,
      content: JSON.stringify(logData.meta.content, null, 2),
    },
  };
}
