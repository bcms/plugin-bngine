import { StoreGetterTypes, StoreMutationTypes } from './enums';
import { StoreState } from './main';

type EntityItem = number;

export interface StoreTestMutations {
  [StoreMutationTypes.test_set](state: StoreState, payload: EntityItem): void;
}
export interface StoreTestGetters {
  [StoreGetterTypes.test](state: StoreState): EntityItem;
}
