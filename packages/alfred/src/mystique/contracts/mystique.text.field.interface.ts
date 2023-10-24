import { MystiqueBaseFieldInterface } from './mystique.base.field.interface';

export interface MystiqueTextFieldInterface extends MystiqueBaseFieldInterface {
  type: 'text' | 'hidden';
  multiline?: boolean;
  rowsMax?: number;
}
