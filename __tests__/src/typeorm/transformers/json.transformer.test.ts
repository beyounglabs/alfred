import { Container } from 'typedi';
import { TestCase } from '../../../../src/tests/test.case';
import { JsonTransformer } from '../../../../src/typeorm/transformers/json.transformer';
import { expect } from 'chai';

const testCase = Container.get(TestCase);

describe('JsonTransformer', () => {
  before(async function() {
    await testCase.setup(this);
  });

  const transformer = new JsonTransformer();

  it('from', async () => {
    expect(
      JSON.stringify(transformer.from(JSON.stringify({ a: 1 })), null, 2),
    ).to.equal(JSON.stringify({ a: 1 }, null, 2));
    expect(JSON.stringify(transformer.from({ a: 1 }), null, 2)).to.equal(
      JSON.stringify({ a: 1 }, null, 2),
    );
  });

  it('to', async () => {
    expect(transformer.to(JSON.stringify({ a: 1 }))).to.equal(
      JSON.stringify({ a: 1 }),
    );
    expect(transformer.to({ a: 1 })).to.equal(JSON.stringify({ a: 1 }));
  });
});
