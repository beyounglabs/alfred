export function performanceLoggerStart(label: string): void {
  if (String(process.env.ENABLE_PERFORMANCE_LOGGER) !== '1') {
    return;
  }

  console.time(label);
}

export function performanceLoggerEnd(label: string): void {
  if (String(process.env.ENABLE_PERFORMANCE_LOGGER) !== '1') {
    return;
  }

  console.timeEnd(label);
}
