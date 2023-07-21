import { ColumnOptions } from 'typeorm/decorator/options/ColumnOptions';
import { BooleanTransformer } from './transformers/boolean.transformer';
import { JsonTransformer } from './transformers/json.transformer';
import { NumberTransformer } from './transformers/number.transformer';

export class DefaultMetadata {
  public static getDefaultEngine(): string {
    if (process.env.DB_TYPE === 'sqlite') {
      return '';
    }

    return String(process.env.DB_DEFAULT_ENGINE ?? 'InnoDB');
  }

  public static getColumnOptions(params: ColumnOptions): ColumnOptions {
    if (params.type === 'json') {
      params.type = this.getJsonDataType();
      params.transformer = new JsonTransformer();
    }

    if (params.type === 'text') {
      params.type = this.getTextDataType();
    }

    if (params.type === 'longtext') {
      params.type = this.getLongTextDataType();
    }

    if (params.type === 'decimal') {
      params.type = this.getDecimalDataType();
      params.transformer = new NumberTransformer();
    }

    if (params.type === 'integer') {
      delete params.length;

      params.transformer = new NumberTransformer();
    }

    if (params.type === 'bigint') {
      delete params.length;
      params.transformer = new NumberTransformer();
    }

    if (params.type === 'boolean') {
      params.type = this.getBooleanDataType();
      params.transformer = new BooleanTransformer();
    }

    if (params.type === 'datetime') {
      params.type = this.getDatetimeDataType();
    }

    if (params.type === 'blob') {
      params.type = this.getBlobDataType();
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

  public static getLongTextDataType(): any {
    if (this.getDefaultEngine() === 'memory') {
      return 'varchar';
    }

    if (process.env.DB_TYPE === 'mysql') {
      return 'longtext';
    }

    return this.getTextDataType();
  }

  public static getBlobDataType(): any {
    if (process.env.DB_TYPE === 'mysql') {
      return 'longblob';
    }

    return 'bytea';
  }

  public static getDecimalDataType(): any {
    if (process.env.DB_TYPE === 'mysql') {
      return 'decimal';
    }

    return 'numeric';
  }

  public static getBooleanDataType(): any {
    if (process.env.DB_TYPE === 'postgres') {
      return 'boolean';
    }
    return 'tinyint';
  }

  public static getDatetimeDataType(): any {
    if (process.env.DB_TYPE === 'postgres') {
      return 'timestamp';
    }

    return 'datetime';
  }
}
