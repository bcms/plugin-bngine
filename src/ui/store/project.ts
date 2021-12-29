import type { GetterTree, MutationTree } from 'vuex';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';
import { Project } from '../../backend/types';
import {
  StoreGetterTypes,
  StoreMutationTypes,
  StoreProjectGetters,
  StoreProjectMutations,
  StoreState,
} from '../types';

const defaultMutations = defaultEntryMutations<Project>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<Project>();

export const mutations: MutationTree<StoreState> & StoreProjectMutations = {
  [StoreMutationTypes.project_set](state, payload) {
    defaultMutations.set(state.project, payload);
  },
  [StoreMutationTypes.project_remove](state, payload) {
    defaultMutations.remove(state.project, payload);
  },
};
export const getters: GetterTree<StoreState, StoreState> & StoreProjectGetters =
  {
    [StoreGetterTypes.project_items](state) {
      return state.project;
    },
    [StoreGetterTypes.project_find](state) {
      return (query) => {
        return defaultGetters.find(state.project, query);
      };
    },
    [StoreGetterTypes.project_findOne](state) {
      return (query) => {
        return defaultGetters.findOne(state.project, query);
      };
    },
  };
