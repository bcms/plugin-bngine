import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ProjectFSDB, ProjectMongoDB } from './models';

export interface ProjectRepoMethods<T> {
  findByName(name: string): Promise<T | null>;
}

export type ProjectRepo =
  | FSDBRepository<ProjectFSDB, ProjectRepoMethods<ProjectFSDB>>
  | MongoDBCachedRepository<ProjectMongoDB, ProjectRepoMethods<ProjectMongoDB>>;
