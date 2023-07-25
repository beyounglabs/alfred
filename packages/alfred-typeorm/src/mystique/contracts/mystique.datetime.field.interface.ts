import { MystiqueBaseFieldInterface } from './mystique.base.field.interface';

export interface MystiqueDatetimeFieldInterface
  extends MystiqueBaseFieldInterface {
  type: 'datetime' | 'datetime-local';
}
