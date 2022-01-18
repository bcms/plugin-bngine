import { ProjectVar, Job, JobLite } from '../../backend/types';
import { Store, StoreMutationTypes } from '../types';

export interface JobHandler {
  start(data: {
    projectId: string;
    branch?: string;
    vars?: ProjectVar[];
  }): Promise<Job>;
  getAll(): Promise<JobLite[]>;
  get(data: { id: string; skipCache?: boolean }): Promise<Job>;
  getPipeLogs(data: {
    jobId: string;
    pipeId: string;
  }): Promise<{ stdout: string; stderr: string }>;
}

export function createJobHandler({ store }: { store: Store }): JobHandler {
  let getAllLetch = false;
  const baseUrl = '/plugin/bcms-plugin---name/job';

  return {
    async getAll() {
      if (getAllLetch) {
        return store.getters.job_items;
      }

      const result: {
        jobs: JobLite[];
      } = await window.bcms.sdk.send({
        url: `${baseUrl}/all`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });

      store.commit(StoreMutationTypes.job_set, result.jobs);

      getAllLetch = true;

      return result.jobs;
    },
    async start(data) {
      const result: {
        job: Job;
      } = await window.bcms.sdk.send({
        url: `${baseUrl}/start`,
        method: 'POST',
        headers: {
          Authorization: '',
        },
        data,
      });

      store.commit(StoreMutationTypes.job_set, result.job);

      return result.job;
    },
    async get({ id, skipCache }) {
      if (!skipCache) {
        const cacheHit = store.getters.job_findOne((e) => e._id === id);

        if (cacheHit && (cacheHit as Job).pipe) {
          return cacheHit as Job;
        }
      }

      const result: {
        job: Job;
      } = await window.bcms.sdk.send({
        url: `${baseUrl}/${id}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });

      store.commit(StoreMutationTypes.job_set, result.job);

      return result.job;
    },
    async getPipeLogs(data) {
      const result: {
        stdout: string;
        stderr: string;
      } = await window.bcms.sdk.send({
        url: `${baseUrl}/${data.jobId}/log/${data.pipeId}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });

      return result;
    },
  };
}