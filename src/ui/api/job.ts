import type { ProjectVar, Job, JobLite } from '../../backend/types';
import type { Store } from '../types';
import { StoreMutationTypes } from '../types';

export interface JobHandler {
  start(data: {
    projectId: string;
    branch?: string;
    vars?: ProjectVar[];
  }): Promise<Job>;
  getAll(data?: {
    projectId?: string;
    itemsPerPage?: number;
    page?: number;
  }): Promise<JobLite[]>;
  get(data: { id: string; skipCache?: boolean }): Promise<Job>;
  getPipeLogs(data: {
    jobId: string;
    pipeId: string;
  }): Promise<{ stdout: string; stderr: string }>;
  count(): Promise<number>;
}

export function createJobHandler({ store }: { store: Store }): JobHandler {
  const getAllLetch: {
    [query: string]: boolean;
  } = {};
  const baseUrl = '/plugin/bcms-plugin---name/job';

  return {
    async getAll(data) {
      let query = '';

      if (data) {
        const q: string[] = [];

        if (data.projectId) {
          q.push(`projectId=${data.projectId}`);
        }
        if (data.itemsPerPage) {
          q.push(`limit=${data.itemsPerPage}`);
        }
        if (data.page) {
          q.push(`offset=${data.page}`);
        }

        if (q.length > 0) {
          query = '?' + q.join('&');
        }
      }

      if (getAllLetch[query]) {
        return store.getters.job_items;
      }

      const result: {
        jobs: JobLite[];
      } = await window.bcms.sdk.send({
        url: `${baseUrl}/all${query}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });

      store.commit(StoreMutationTypes.job_set, result.jobs);

      getAllLetch[query] = true;

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
    async count() {
      const result: {
        count: number;
      } = await window.bcms.sdk.send({
        url: `${baseUrl}/count`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });

      return result.count;
    },
  };
}
