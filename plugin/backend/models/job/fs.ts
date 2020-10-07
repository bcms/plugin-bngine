import type { FSDBEntity } from '@becomes/purple-cheetah';
import type { JobPipe, JobStatus } from './mongo';

export class JobFS implements FSDBEntity {
  constructor(
    public _id: string,
    public createdAt: number,
    public updatedAt: number,
    public finishedAt: number,
    public inQueueFor: number,
    public repo: {
      name: string;
      branch: string;
    },
    public running: boolean,
    public status: JobStatus,
    public project: string,
    public pipe: JobPipe[],
  ) {}
}
