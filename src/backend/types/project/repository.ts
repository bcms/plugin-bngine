import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import { Project } from '.';

export interface ProjectRepoMethods {
  findByName(name: string): Promise<Project | null>;
}

export type ProjectRepo =
  | FSDBRepository<Project, ProjectRepoMethods>
  | MongoDBCachedRepository<Project, ProjectRepoMethods>;
