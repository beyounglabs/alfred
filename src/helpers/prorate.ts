export type ProrateItem = {
  qty?: number;
  value: number;
};

function round(value: number): number {
  return parseFloat(parseFloat(String(value)).toFixed(2));
}

function roundFloor(value: number): number {
  return parseFloat(
    parseFloat(String(Math.floor(value * 100) / 100)).toFixed(2),
  );
}

function findBestIndex(items: ProrateItem[]): number {
  const index = items.findIndex(item => (item.qty ?? 1) === 1);
  if (index === -1) {
    return 0;
  }

  return index;
}

export function prorate(
  valueToBeProrated: number,
  items: ProrateItem[],
): number[] {
  let totalValue = 0;
  for (const item of items) {
    const qty = item.qty ?? 1;
    totalValue += item.value * qty;
  }

  const proratedItems: number[] = [];

  for (const item of items) {
    const qty = item.qty ?? 1;
    const itemTotalValue = item.value * qty;
    let proratedItem = round((itemTotalValue / totalValue) * valueToBeProrated);

    const periodicDecimalVerification = round(round(proratedItem / qty) * qty);

    if (proratedItem !== periodicDecimalVerification) {
      proratedItem = round(roundFloor(proratedItem / qty) * qty);
    }

    proratedItems.push(proratedItem);
  }

  let sumProratedItems = 0;
  for (const proratedItem of proratedItems) {
    sumProratedItems += proratedItem;
  }

  if (round(sumProratedItems) !== round(valueToBeProrated)) {
    const difference = round(valueToBeProrated - sumProratedItems);
    const index = findBestIndex(items);

    proratedItems[index] = round(proratedItems[index] + difference);
  }

  return proratedItems;
}
