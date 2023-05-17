import { BCMSConfig } from '@becomes/cms-backend/config';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache';
import { Repo } from '../repo';
import { Job, JobSchema, JobStatus } from './models';
import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache/types';
import { objectSchemaToMongoDBSchema } from '@becomes/purple-cheetah-mod-mongodb';

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

export function createJobRepo(): void {
  const name = 'Job repository';
  const collection = `${BCMSConfig.database.prefix}_bngine_jobs`;
  if (BCMSConfig.database.fs) {
    Repo.job = createFSDBRepository<Job, JobRepoMethods>({
      name,
      collection,
      schema: JobSchema,
      methods({ repo }) {
        return {
          async findAllByLimitAndOffset(limit, offset) {
            return (await repo.findAll()).slice(
              limit * offset,
              limit + limit * offset
            );
          },

          async findAllByProjectIdAndLimitAndOffset(projectId, limit, offset) {
            return (await repo.findAllBy((e) => e.project === projectId)).slice(
              limit * offset,
              limit + limit * offset
            );
          },

          async findAllByStatus(status) {
            return await repo.findAllBy((e) => e.status === status);
          },
        };
      },
    });
  } else {
    Repo.job = createMongoDBCachedRepository<Job, JobRepoMethods, unknown>({
      name,
      collection,
      schema: objectSchemaToMongoDBSchema(JobSchema),
      methods({ mongoDBInterface, cacheHandler }) {
        return {
          async findAllByLimitAndOffset(limit, offset) {
            const items = await mongoDBInterface
              .find()
              .limit(limit)
              .skip(offset * limit);
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              cacheHandler.set(item._id, item);
            }
            return items;
          },

          async findAllByProjectIdAndLimitAndOffset(projectId, limit, offset) {
            const items = await mongoDBInterface
              .find({ project: projectId })
              .limit(limit)
              .skip(offset * limit);
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              cacheHandler.set(item._id, item);
            }
            return items;
          },

          async findAllByStatus(status) {
            const items = await mongoDBInterface.find({ status });
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              cacheHandler.set(item._id, item);
            }
            return items;
          },
        };
      },
    });
  }
}
