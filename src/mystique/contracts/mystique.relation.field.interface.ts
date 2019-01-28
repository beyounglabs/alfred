import { MystiqueBaseFieldInterface } from './mystique.base.field.interface';

export interface MystiqueRelationFieldInterface
  extends Partial<MystiqueBaseFieldInterface> {
  type: 'relation';
  label?: string;
  entityName: string;
  resource?: string;
  name?: string;
}
