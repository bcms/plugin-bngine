import type { JobStatus } from '../models';

export interface JobLite {
  _id: string;
  createdAt: number;
  updatedAt: number;
  finishedAt: number;
  inQueueFor: number;
  repo: {
    name: string;
    branch: string;
  };
  running: boolean;
  status: JobStatus;
  project: string;
}
