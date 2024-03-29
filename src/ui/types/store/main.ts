import type { Project, Job, JobLite } from '../../../backend/types';
import type { CommitOptions, DispatchOptions, Store as VuexStore } from 'vuex';
import type { StoreProjectGetters, StoreProjectMutations } from './project';
import type { StoreJobGetters, StoreJobMutations } from './job';

export interface StoreState {
  project: Project[];
  job: Array<Job | JobLite>;
}

export type StoreMutations = StoreProjectMutations & StoreJobMutations;
export type StoreGetters = StoreProjectGetters & StoreJobGetters;
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
