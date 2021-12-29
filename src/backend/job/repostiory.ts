import { BCMSConfig } from '@becomes/cms-backend/config';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { Repo } from '../repo';
import { Job, JobFSDBSchema, JobMongoDBSchema, JobRepoMethods } from '../types';

export function createJobRepo(): void {
  const name = 'Job repository';
  const collection = `${BCMSConfig.database.prefix}_bngine_jobs`;
  Repo.job = BCMSConfig.database.fs
    ? createFSDBRepository<Job, JobRepoMethods>({
        name,
        collection,
        schema: JobFSDBSchema,
        methods({ repo }) {
          return {
            async findAllByLimitAndOffset(limit, offset) {
              return (await repo.findAll()).slice(
                limit * offset,
                limit + limit * offset
              );
            },
            async findAllByProjectIdAndLimitAndOffset(
              projectId,
              limit,
              offset
            ) {
              return (
                await repo.findAllBy((e) => e.project === projectId)
              ).slice(limit * offset, limit + limit * offset);
            },
            async findAllByStatus(status) {
              return await repo.findAllBy((e) => e.status === status);
            },
          };
        },
      })
    : createMongoDBCachedRepository<Job, JobRepoMethods, unknown>({
        name,
        collection,
        schema: JobMongoDBSchema,
        methods({ mongoDBInterface, cacheHandler }) {
          const limitOffsetLatch: {
            [key: string]: boolean;
          } = {};
          const statusLatch: {
            [key: string]: boolean;
          } = {};
          return {
            async findAllByLimitAndOffset(limit, offset) {
              const latchKey = `${limit}${offset}`;
              if (limitOffsetLatch[latchKey]) {
                return cacheHandler
                  .findAll()
                  .slice(offset * limit, offset * limit + limit);
              }
              const items = await mongoDBInterface
                .find()
                .limit(limit)
                .skip(offset * limit);
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                cacheHandler.set(item._id, item);
              }
              limitOffsetLatch[latchKey] = true;
              return items;
            },
            async findAllByProjectIdAndLimitAndOffset(
              projectId,
              limit,
              offset
            ) {
              const latchKey = `${projectId}${limit}${offset}`;
              if (limitOffsetLatch[latchKey]) {
                return cacheHandler
                  .find((e) => `${e.project}` === projectId)
                  .slice(offset * limit, offset * limit + limit);
              }
              // TODO: Change _id to project in method find
              const items = await mongoDBInterface
                .find({ project: projectId })
                .limit(limit)
                .skip(offset * limit);
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                cacheHandler.set(item._id, item);
              }
              limitOffsetLatch[latchKey] = true;
              return items;
            },
            async findAllByStatus(status) {
              if (statusLatch[status]) {
                return cacheHandler.find((e) => e.status === status);
              }
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
