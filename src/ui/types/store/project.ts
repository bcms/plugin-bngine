import { BCMSStoreGetterQuery } from '@becomes/cms-ui/types';
import { StoreGetterTypes, StoreMutationTypes, StoreState } from '.';
import { Project } from '../../../backend/types';

type EntityItem = Project;

export interface StoreProjectMutations {
  [StoreMutationTypes.project_set](
    state: StoreState,
    payload: EntityItem | EntityItem[]
  ): void;
  [StoreMutationTypes.project_remove](
    state: StoreState,
    payload: EntityItem | EntityItem[]
  ): void;
}

export interface StoreProjectGetters {
  [StoreGetterTypes.project_items](state: StoreState): EntityItem[];
  [StoreGetterTypes.project_find](
    state: StoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [StoreGetterTypes.project_findOne](
    state: StoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
