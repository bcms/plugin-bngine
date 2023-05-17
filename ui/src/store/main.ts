import type { Job, JobLite } from '@backend/job';
import type { ProjectProtected } from '@backend/project';
import { createArrayStore } from '@banez/vue-array-store';

export const store = {
  job: createArrayStore<Job>('_id', []),
  jobLite: createArrayStore<JobLite>('_id', []),
  project: createArrayStore<ProjectProtected>('_id', []),
};
