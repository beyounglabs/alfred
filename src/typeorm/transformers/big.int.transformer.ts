import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';

export class BigIntTransformer implements ValueTransformer {
  public from(value) {
    return BigInt(value);
  }

  public to(value) {
    return BigInt(value);
  }
}
