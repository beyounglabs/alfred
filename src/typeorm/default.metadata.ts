import { ColumnOptions } from 'typeorm/decorator/options/ColumnOptions';
import { JsonTransformer } from './transformers/json.transformer';
import { BooleanTransformer } from './transformers/boolean.transformer';

export class DefaultMetadata {
  public static getDefaultEngine(): string {
    return String(process.env.DB_DEFAULT_ENGINE);
  }

  public static getColumnOptions(params: ColumnOptions): ColumnOptions {
    if (params.type === 'json') {
      params.type = this.getJsonDataType();
      params.transformer = new JsonTransformer();
    }

    if (params.type === 'text') {
      params.type = this.getTextDataType();
    }

    if (params.type === 'decimal') {
      params.type = this.getDecimalDataType();
    }

    if (params.type === 'integer') {
      if (process.env.DB_TYPE !== 'mysql') {
        delete params.length;
      }
    }

    if (params.type === 'boolean') {
      params.type = 'tinyint';
      params.transformer = new BooleanTransformer();
    }

    return params;
  }

  public static getJsonDataType(): any {
    if (this.getDefaultEngine() === 'memory') {
      return this.getTextDataType();
    }

    if (process.env.DB_TYPE === 'mysql') {
      return 'json';
    }

    return this.getTextDataType();
  }

  public static getTextDataType(): any {
    if (this.getDefaultEngine() === 'memory') {
      return 'varchar';
    }

    return 'text';
  }

  public static getDecimalDataType(): any {
    if (process.env.DB_TYPE === 'mysql') {
      return 'decimal';
    }

    return 'numeric';
  }
}
