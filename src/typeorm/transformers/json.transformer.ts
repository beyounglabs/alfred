import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';

export class JsonTransformer implements ValueTransformer {
  public from(value) {
    if (typeof value === 'string' && process.env.DB_TYPE === 'sqlite') {
      return JSON.parse(value);
    }

    return value;
  }

  public to(value) {
    return value;
  }
}
