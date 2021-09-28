import {
  ActionTree,
  createLogger,
  createStore,
  GetterTree,
  MutationTree,
} from 'vuex';
import {
  Store,
  StoreActions,
  StoreGetters,
  StoreMutations,
  StoreState,
} from '../types';
import * as TestStore from './test';

const state: StoreState = {
  test: 0,
};

export const mutations: MutationTree<StoreState> & StoreMutations = {
  ...TestStore.mutations,
};
export const getters: GetterTree<StoreState, StoreState> & StoreGetters = {
  ...TestStore.getters,
};
export const actions: ActionTree<StoreState, StoreState> & StoreActions = {};

export const store = createStore<StoreState>({
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
