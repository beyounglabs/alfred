export function roundNumber(value: number, precision: number = 2): number {
  return Number(value.toFixed(precision));
}
