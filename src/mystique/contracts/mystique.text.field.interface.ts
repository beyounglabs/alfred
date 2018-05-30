import { MystiqueBaseFieldInterface } from './mystique.base.field.interface';

export interface MystiqueTextFieldInterface extends MystiqueBaseFieldInterface {
  type: 'text';
  multiline?: boolean;
  rowsMax?: number;
}
