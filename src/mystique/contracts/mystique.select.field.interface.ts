import { MystiqueBaseFieldInterface } from './mystique.base.field.interface';

export interface MystiqueSelectFieldInterface
  extends MystiqueBaseFieldInterface {
  type: 'select' | 'select_boolean';
  values: {
    label: string;
    value: string | number;
  }[];
  multiple?: boolean;
  required?: boolean;
}
