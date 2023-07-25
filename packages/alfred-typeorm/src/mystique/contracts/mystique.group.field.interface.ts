import { MystiqueBaseFieldInterface } from './mystique.base.field.interface';
import { MystiqueFieldInterface } from './mystique.field.interface';

export interface MystiqueGroupFieldInterface
  extends Partial<MystiqueBaseFieldInterface> {
  type: 'group';
  label: string;
  fields?: MystiqueFieldInterface[];
  component?: {
    path: string;
    props: Partial<Record<string, any>>;
  };
}
