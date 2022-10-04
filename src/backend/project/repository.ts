import { BCMSConfig } from '@becomes/cms-backend/config';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import type { ProjectRepoMethods, Project } from '../types';
import { Repo } from '../repo';
import { ProjectFSDBSchema, ProjectMongoDBSchema } from '../schemas';

export function createProjectRepo(): void {
  const name = 'Project repository';
  const collection = `${BCMSConfig.database.prefix}_bngine_projects`;
  Repo.project = BCMSConfig.database.fs
    ? createFSDBRepository<Project, ProjectRepoMethods>({
        name,
        collection,
        schema: ProjectFSDBSchema,
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
        schema: ProjectMongoDBSchema,
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
