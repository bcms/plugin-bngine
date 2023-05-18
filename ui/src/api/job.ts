import type { Job, JobLite, JobStartBody } from '@backend/job';
import { store } from '@ui/store';

export class JobHandler {
  private getAllLetch: {
    [query: string]: boolean;
  } = {};
  private baseUrl = '/plugin/bcms-plugin---name/job';

  async start(data: JobStartBody): Promise<Job> {
    const result: {
      job: Job;
    } = await window.bcms.sdk.send({
      url: `${this.baseUrl}/start`,
      method: 'POST',
      headers: {
        Authorization: '',
      },
      data,
    });
    store.job.set(result.job);
    return result.job;
  }

  async getAll(data?: {
    projectId?: string;
    itemsPerPage?: number;
    page?: number;
  }): Promise<JobLite[]> {
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
    if (this.getAllLetch[query]) {
      return store.jobLite.items();
    }
    const result: {
      jobs: JobLite[];
    } = await window.bcms.sdk.send({
      url: `${this.baseUrl}/all${query}`,
      method: 'GET',
      headers: {
        Authorization: '',
      },
    });
    store.jobLite.set([...result.jobs]);
    this.getAllLetch[query] = true;
    return result.jobs;
  }

  async get(data: { id: string; skipCache?: boolean }): Promise<Job> {
    if (!data.skipCache) {
      const cacheHit = store.job.findById(data.id);
      if (cacheHit && cacheHit.pipe) {
        return cacheHit as Job;
      }
    }
    const result: {
      job: Job;
    } = await window.bcms.sdk.send({
      url: `${this.baseUrl}/${data.id}`,
      method: 'GET',
      headers: {
        Authorization: '',
      },
    });
    store.job.set(result.job);
    return result.job;
  }

  async getPipeLogs(data: {
    jobId: string;
    pipeId: string;
  }): Promise<{ stdout: string; stderr: string }> {
    const result: {
      stdout: string;
      stderr: string;
    } = await window.bcms.sdk.send({
      url: `${this.baseUrl}/${data.jobId}/log/${data.pipeId}`,
      method: 'GET',
      headers: {
        Authorization: '',
      },
    });
    return result;
  }

  async count(): Promise<number> {
    const result: {
      count: number;
    } = await window.bcms.sdk.send({
      url: `${this.baseUrl}/count`,
      method: 'GET',
      headers: {
        Authorization: '',
      },
    });

    return result.count;
  }
}
