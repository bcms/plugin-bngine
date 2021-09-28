import { GetterTree, MutationTree } from 'vuex';
import {
  StoreGetterTypes,
  StoreMutationTypes,
  StoreState,
  StoreTestGetters,
  StoreTestMutations,
} from '../types';

export const mutations: MutationTree<StoreState> & StoreTestMutations = {
  [StoreMutationTypes.test_set](state, payload) {
    state.test = payload;
  },
};

export const getters: GetterTree<StoreState, StoreState> & StoreTestGetters = {
  [StoreGetterTypes.test](state) {
    return state.test;
  },
};
