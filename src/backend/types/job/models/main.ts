import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { JobPipe } from './pipe';

// eslint-disable-next-line no-shadow
export enum JobStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  RUNNING = 'RUNNING',
  QUEUE = 'QUEUE',
  CANCELED = 'CANCELED',
}

export interface Job extends FSDBEntity {
  userId: string;
  finishedAt: number;
  inQueueFor: number;
  repo: {
    name: string;
    branch: string;
  };
  running: boolean;
  status: JobStatus;
  project: string;
  pipe: JobPipe[];
}
