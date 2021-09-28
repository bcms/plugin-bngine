import { CommitOptions, DispatchOptions, Store as VuexStore } from 'vuex';
import { StoreTestGetters, StoreTestMutations } from './test';

export interface StoreState {
  test: number;
}

export type StoreMutations = StoreTestMutations;
export type StoreGetters = StoreTestGetters;
export type StoreActions = { [name: string]: any };

export type Store = Omit<
  VuexStore<StoreState>,
  'getters' | 'commit' | 'dispatch'
> & {
  commit<
    K extends keyof StoreMutations,
    P extends Parameters<StoreMutations[K]>[1]
  >(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<StoreMutations[K]>;
} & {
  dispatch<K extends keyof StoreActions>(
    key: K,
    payload?: Parameters<StoreActions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<StoreActions[K]>;
} & {
  getters: {
    [K in keyof StoreGetters]: ReturnType<StoreGetters[K]>;
  };
};
