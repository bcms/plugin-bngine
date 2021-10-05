import { BCMSConfig } from '@becomes/cms-backend/src/config';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { JobFactory } from '.';
import { Repo } from '../repo';
import {
  Job,
  JobFSDB,
  JobFSDBSchema,
  JobLite,
  JobMongoDB,
  JobMongoDBSchema,
  JobRepoMethods,
} from '../types';

export function createJobRepo(): void {
  const name = 'Job repository';
  const collection = `${BCMSConfig.database.prefix}__bngine_projects`;
  Repo.job = BCMSConfig.database.fs
    ? createFSDBRepository<JobFSDB, JobRepoMethods<JobFSDB>>({
        name,
        collection,
        schema: JobFSDBSchema,
        methods({ repo }) {
          return {
            async findAllByLimitAndOffset(limit, offset) {
              const data: { limit: number; offset: number } = {
                limit: parseInt((limit as unknown) as string),
                offset: parseInt((offset as unknown) as string),
              };
              if (isNaN(data.limit) || data.limit < 0 || data.limit > 20) {
                data.limit = 20;
              }
              if (isNaN(data.offset) || data.offset < 0) {
                data.offset = 0;
              }
              const jobs = await repo.findAll();
              return jobs;
              //  jobs = jobs.slice(
              //   data.offset * data.limit,
              //   data.offset * data.limit + data.limit,
              // ),
              // offset: data.offset,
              // limit: data.limit,
              // pages: parseInt(`${jobs.length / data.limit}`),
            },
            async findAllByProjectIdAndLimitAndOffset(
              limit,
              offset,
              projectId
            ) {
              const data: {
                limit: number;
                offset: number;
                projectId: string;
              } = {
                limit: parseInt((limit as unknown) as string),
                offset: parseInt((offset as unknown) as string),
                projectId: `${projectId}`,
              };
              if (isNaN(data.limit) || data.limit < 0 || data.limit > 20) {
                data.limit = 20;
              }
              if (isNaN(data.offset) || data.offset < 0) {
                data.offset = 0;
              }
              const jobs = await repo.findAllBy(
                (e) => e.project === data.projectId
              );
              //   return {
              //     jobs: jobs.slice(
              //      data.offset * data.limit,
              //      data.offset * data.limit + data.limit,
              //    ),
              //    offset: data.offset,
              //    limit: data.limit,
              //    pages: parseInt(`${jobs.length / data.limit}`),
              //  };
              return jobs;
            },
          };
        },
      })
    : createMongoDBCachedRepository<
        JobMongoDB,
        JobRepoMethods<JobMongoDB>,
        unknown
      >({
        name,
        collection,
        schema: JobMongoDBSchema,
        methods({ mongoDBInterface, cacheHandler }) {
          return {
            async findAllByLimitAndOffset(limit, offset) {
              const data: { limit: number; offset: number } = {
                limit: parseInt((limit as unknown) as string),
                offset: parseInt((offset as unknown) as string),
              };
              if (isNaN(data.limit) || data.limit < 0 || data.limit > 20) {
                data.limit = 20;
              }
              if (isNaN(data.offset) || data.offset < 0) {
                data.offset = 0;
              }

              const jobs = await mongoDBInterface.find();

              return jobs;
              //   return {
              //     jobs: jobs.slice(
              //      data.offset * data.limit,
              //      data.offset * data.limit + data.limit,
              //    ),
              //    offset: data.offset,
              //    limit: data.limit,
              //    pages: parseInt(`${jobs.length / data.limit}`),
              //  };
            },
            async findAllByProjectIdAndLimitAndOffset(
              limit,
              offset,
              projectId
            ) {
              const data: {
                limit: number;
                offset: number;
                projectId: string;
              } = {
                limit: parseInt((limit as unknown) as string),
                offset: parseInt((offset as unknown) as string),
                projectId: `${projectId}`,
              };
              if (isNaN(data.limit) || data.limit < 0 || data.limit > 20) {
                data.limit = 20;
              }
              if (isNaN(data.offset) || data.offset < 0) {
                data.offset = 0;
              }
              const jobs = await mongoDBInterface.findOne(
                (e: Job) => e.project === data.projectId
              );
              //   return {
              //     jobs: jobs.slice(
              //      data.offset * data.limit,
              //      data.offset * data.limit + data.limit,
              //    ),
              //    offset: data.offset,
              //    limit: data.limit,
              //    pages: parseInt(`${jobs.length / data.limit}`),
              //  };
              return jobs;
            },
          };
        },
      });
}
