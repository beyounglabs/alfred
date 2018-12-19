import { MystiqueActionsType } from './mystique.actions.type';

export interface MystiqueSearchConfigInterface<E extends any> {
  getActions?: (entity: E) => MystiqueActionsType;
}
