import { Container } from 'typedi';
import { beforeAll, describe, expect, it } from 'vitest';
import { TestCase } from '../../../../src/tests/test.case';
import { BooleanTransformer } from '../../../../src/typeorm/transformers/boolean.transformer';

const testCase = Container.get(TestCase);

describe('BooleanTransformer', () => {
  beforeAll(async function () {
    await testCase.setup();
  });

  const transformer = new BooleanTransformer();

  it('from', async () => {
    expect(transformer.from(1)).to.equal(true);
    expect(transformer.from(0)).to.equal(false);
    expect(transformer.from(true)).to.equal(true);
    expect(transformer.from(false)).to.equal(false);
  });

  it('to', async () => {
    expect(transformer.to(1)).to.equal(1);
    expect(transformer.to(0)).to.equal(0);
    expect(transformer.to(true)).to.equal(1);
    expect(transformer.to(false)).to.equal(0);
  });
});
