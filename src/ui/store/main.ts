import { createLogger, createStore, GetterTree, MutationTree } from 'vuex';
import type { Store, StoreGetters, StoreMutations, StoreState } from '../types';
import * as ProjectStore from './project';
import * as JobStore from './job';

export const state: StoreState = {
  project: [],
  job: [],
};

export const mutations: MutationTree<StoreState> & StoreMutations = {
  ...ProjectStore.mutations,
  ...JobStore.mutations,
};
export const getters: GetterTree<StoreState, StoreState> & StoreGetters = {
  ...ProjectStore.getters,
  ...JobStore.getters,
};

export const store: Store = createStore<StoreState>({
  state,
  mutations,
  getters,
  plugins: window.location.href.indexOf('localhost:8080')
    ? [createLogger()]
    : undefined,
});

export function useStore(): Store {
  return store;
}
