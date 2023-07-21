import { describe, it, expect } from 'vitest';
import { Apm } from '../../../src/apm/apm';

describe('APM', () => {
  it('startSpan', async () => {
    const apm = new Apm();
    const a = await apm.startSpan<string>('Test', () => {
      return 'a';
    });

    expect('a').toBe(a);
  });
});
