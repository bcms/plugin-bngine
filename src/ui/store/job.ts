import type { GetterTree, MutationTree } from 'vuex';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';
import type { Job, JobLite } from '../../backend/types';
import {
  StoreGetterTypes,
  StoreMutationTypes,
  StoreJobGetters,
  StoreJobMutations,
  StoreState,
} from '../types';

type EntityItem = Job | JobLite;

const defaultMutations = defaultEntryMutations<EntityItem>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<EntityItem>();

export const mutations: MutationTree<StoreState> & StoreJobMutations = {
  [StoreMutationTypes.job_set](state, payload) {
    defaultMutations.set(state.job, payload);
  },
  [StoreMutationTypes.job_remove](state, payload) {
    defaultMutations.remove(state.job, payload);
  },
};
export const getters: GetterTree<StoreState, StoreState> & StoreJobGetters = {
  [StoreGetterTypes.job_items](state) {
    return state.job;
  },
  [StoreGetterTypes.job_find](state) {
    return (query) => {
      return defaultGetters.find(state.job, query);
    };
  },
  [StoreGetterTypes.job_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.job, query);
    };
  },
};
