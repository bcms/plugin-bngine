import { BCMSConfig } from '@becomes/cms-backend/config';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { Repo } from '../repo';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache';
import { Project, ProjectSchema } from './models';
import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache/types';
import { objectSchemaToMongoDBSchema } from '@becomes/purple-cheetah-mod-mongodb';

export interface ProjectRepoMethods {
  findByName(name: string): Promise<Project | null>;
}

export type ProjectRepo =
  | FSDBRepository<Project, ProjectRepoMethods>
  | MongoDBCachedRepository<Project, ProjectRepoMethods>;

export function createProjectRepo(): void {
  const name = 'Project repository';
  const collection = `${BCMSConfig.database.prefix}_bngine_projects`;
  Repo.project = BCMSConfig.database.fs
    ? createFSDBRepository<Project, ProjectRepoMethods>({
        name,
        collection,
        schema: ProjectSchema,
        methods({ repo }) {
          return {
            async findByName(nm) {
              return await repo.findBy((e) => e.name === nm);
            },
          };
        },
      })
    : createMongoDBCachedRepository<Project, ProjectRepoMethods, unknown>({
        name,
        collection,
        schema: objectSchemaToMongoDBSchema(ProjectSchema),
        methods({ mongoDBInterface, cacheHandler }) {
          return {
            async findByName(nm) {
              const cacheHit = cacheHandler.findOne((e) => e.name === nm);
              if (cacheHit) {
                return cacheHit;
              }
              const item = await mongoDBInterface.findOne({ name: nm });
              if (item) {
                cacheHandler.set(item._id, item);
              }
              return item;
            },
          };
        },
      });
}
