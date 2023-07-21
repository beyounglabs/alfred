/**
 * Returns a function that returns the time (in seconds) passed since the invocation
 */
export function getPerformanceTime(): () => number {
  const start = Date.now();

  return () => (Date.now() - start) / 1000;
}
