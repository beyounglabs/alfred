import { describe, it, expect } from 'vitest';
import { prorate, ProrateItem } from '../../../src/helpers/prorate';

describe('Prorate', () => {
  it('Test 1', async () => {
    const valueToBeProrated = 50;
    const items: ProrateItem[] = [
      {
        qty: 1,
        value: 10,
      },
      {
        qty: 1,
        value: 10,
      },
    ];

    const proratedItems = prorate(valueToBeProrated, items);

    expect(proratedItems.length).to.be.equals(2);
    expect(proratedItems[0]).to.be.equals(25);
    expect(proratedItems[1]).to.be.equals(25);
  });

  it('Test 2', async () => {
    const valueToBeProrated = 67.17;
    const items: ProrateItem[] = [
      {
        qty: 1,
        value: 10,
      },
      {
        qty: 1,
        value: 10,
      },
    ];

    const proratedItems = prorate(valueToBeProrated, items);

    expect(proratedItems.length).to.be.equals(2);
    expect(proratedItems[0]).to.be.equals(33.58);
    expect(proratedItems[1]).to.be.equals(33.59);
  });

  it('Test 3', async () => {
    const valueToBeProrated = 100;
    const items: ProrateItem[] = [
      {
        qty: 2,
        value: 10,
      },
      {
        qty: 1,
        value: 10,
      },
    ];

    const proratedItems = prorate(valueToBeProrated, items);

    expect(proratedItems.length).to.be.equals(2);
    expect(proratedItems[0]).to.be.equals(66.66);
    expect(proratedItems[1]).to.be.equals(33.34);
  });

  it('Test 4', async () => {
    const valueToBeProrated = 100;
    const items: ProrateItem[] = [
      {
        qty: 3,
        value: 10,
      },
    ];

    const proratedItems = prorate(valueToBeProrated, items);

    expect(proratedItems.length).to.be.equals(1);
    expect(proratedItems[0]).to.be.equals(100);
  });

  it('Test 5', async () => {
    const valueToBeProrated = 0;
    const items: ProrateItem[] = [
      {
        qty: 2,
        value: 10,
      },
      {
        qty: 1,
        value: 10,
      },
    ];

    const proratedItems = prorate(valueToBeProrated, items);

    expect(proratedItems.length).to.be.equals(2);
    expect(proratedItems[0]).to.be.equals(0);
    expect(proratedItems[1]).to.be.equals(0);
  });

  it('Test 6', async () => {
    const valueToBeProrated = 100;
    const items: ProrateItem[] = [
      {
        qty: 2,
        value: 10,
      },
      {
        qty: 1,
        value: 0,
      },
    ];

    const proratedItems = prorate(valueToBeProrated, items);

    expect(proratedItems.length).to.be.equals(2);
    expect(proratedItems[0]).to.be.equals(100);
    expect(proratedItems[1]).to.be.equals(0);
  });

  it('Test 7', async () => {
    const valueToBeProrated = 100;
    const items: ProrateItem[] = [
      {
        qty: 1,
        value: 0,
      },
      {
        qty: 1,
        value: 0,
      },
    ];

    const proratedItems = prorate(valueToBeProrated, items);

    expect(proratedItems.length).to.be.equals(2);
    expect(proratedItems[0]).to.be.equals(50);
    expect(proratedItems[1]).to.be.equals(50);
  });
});
