import { MystiqueSelectFieldInterface } from './mystique.select.field.interface';
import { MystiqueTextFieldInterface } from './mystique.text.field.interface';

export type MystiqueFieldInterface =
  | MystiqueSelectFieldInterface
  | MystiqueTextFieldInterface;
