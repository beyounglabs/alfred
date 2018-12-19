import { MystiqueActionInterface } from './mystique.action.interface';

export type MystiqueActionsType = Record<
  string,
  Partial<MystiqueActionInterface>
>;
