import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { JobStatus, Job } from './models';

export interface JobRepoMethods {
  findAllByLimitAndOffset(limit: number, offset: number): Promise<Job[]>;
  findAllByProjectIdAndLimitAndOffset(
    projectId: string,
    limit: number,
    offset: number
  ): Promise<Job[]>;
  findAllByStatus(status: JobStatus): Promise<Job[]>;
}

export type JobRepo =
  | FSDBRepository<Job, JobRepoMethods>
  | MongoDBCachedRepository<Job, JobRepoMethods>;
