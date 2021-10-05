import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { JobStatus } from '.';

export interface JobLite extends FSDBEntity {
  status: JobStatus;
  createAt: number;
  finishedAt: number;
  repo: {
    branch: string;
  };
  project: string;
  userId: string;
}
