import { MystiqueBaseFieldInterface } from './mystique.base.field.interface';

export interface MystiqueSelectFieldInterface
  extends MystiqueBaseFieldInterface {
  type: 'select';
  values: {
    label: string;
    value: string | number;
  }[];
  multiple?: boolean;
}
