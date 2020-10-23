import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';

export class NumberTransformer implements ValueTransformer {
  public from(value) {
    if (value === null || value === undefined) {
      return value;
    }

    return Number(value);
  }

  public to(value) {
    if (value === null || value === undefined) {
      return value;
    }

    return Number(value);
  }
}
