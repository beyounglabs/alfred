export function transformer(logData) {
  const transformed: any = {};
  transformed['@timestamp'] = logData.timestamp
    ? logData.timestamp
    : new Date().toISOString();
  transformed.channel = process.env.NODE_ENV;
  transformed.message = logData.message;
  transformed.severity = logData.level;
  transformed.context = logData.meta;
  return transformed;
}
