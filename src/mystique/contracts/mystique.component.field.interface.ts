import { MystiqueBaseFieldInterface } from './mystique.base.field.interface';

export interface MystiqueComponentFieldInterface
  extends MystiqueBaseFieldInterface {
  type: 'component';
  component: {
    path: string;
    props: { [prop: string]: any };
  };
}
