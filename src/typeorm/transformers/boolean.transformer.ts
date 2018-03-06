import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';

export class BooleanTransformer implements ValueTransformer {
  public from(value) {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }

    return value;
  }

  public to(value) {
    if (value === true) {
      return 1;
    }

    if (value === false) {
      return 0;
    }

    return value;
  }
}
