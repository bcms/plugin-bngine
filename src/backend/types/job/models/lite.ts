import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { JobStatus } from './main';

export interface JobLite extends FSDBEntity {
  status: JobStatus;
  createdAt: number;
  finishedAt: number;
  repo: {
    branch: string;
  };
  project: string;
  userId: string;
  inQueueFor: number;
}
