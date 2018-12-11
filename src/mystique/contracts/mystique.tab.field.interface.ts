import { MystiqueBaseFieldInterface } from './mystique.base.field.interface';
import { MystiqueFieldInterface } from './mystique.field.interface';

export interface MystiqueTabFieldInterface
  extends Partial<MystiqueBaseFieldInterface> {
  type: 'tab';
  id: string;
  label: string;
  fields?: MystiqueFieldInterface[];
}
