import { BCMSStoreGetterQuery } from '@becomes/cms-ui/types';
import { StoreGetterTypes, StoreMutationTypes, StoreState } from '.';
import { Job, JobLite } from '../../../backend/types';

type EntityItem = Job | JobLite;

export interface StoreJobMutations {
  [StoreMutationTypes.job_set](
    state: StoreState,
    payload: EntityItem | EntityItem[]
  ): void;
  [StoreMutationTypes.job_remove](
    state: StoreState,
    payload: EntityItem | EntityItem[]
  ): void;
}

export interface StoreJobGetters {
  [StoreGetterTypes.job_items](state: StoreState): EntityItem[];
  [StoreGetterTypes.job_find](
    state: StoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [StoreGetterTypes.job_findOne](
    state: StoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
