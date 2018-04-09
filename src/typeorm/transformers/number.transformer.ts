import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';

export class NumberTransformer implements ValueTransformer {
  public from(value) {
    return Number(value);
  }

  public to(value) {
    return value;
  }
}
