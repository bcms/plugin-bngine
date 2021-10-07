import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { JobFSDB, JobMongoDB, JobStatus } from './models';

export interface JobRepoMethods<T> {
  findAllByLimitAndOffset(limit: number, offset: number): Promise<T[]>;
  findAllByProjectIdAndLimitAndOffset(
    projectId: string,
    limit: number,
    offset: number
  ): Promise<T[]>;
  findAllByStatus(status: JobStatus): Promise<T[]>;
}

export type JobRepo =
  | FSDBRepository<JobFSDB, JobRepoMethods<JobFSDB>>
  | MongoDBCachedRepository<JobMongoDB, JobRepoMethods<JobMongoDB>>;
