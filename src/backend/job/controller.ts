import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import { JobFactory } from '.';
import { Repo } from '../repo';
import type { Job, JobLite } from '../types';

export const JobController = createController({
  name: 'Job controller',
  path: '/job',
  methods() {
    return {
      getAllLite: createControllerMethod<
        unknown,
        { jobs: JobLite[]; limit: number; offset: number; nextUri: string }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ
        ),
        async handler({ request }) {
          let limit = parseInt(request.query.limit as string);
          if (isNaN(limit) || limit < 0 || limit > 50) {
            limit = 50;
          }
          let offset = parseInt(request.query.offset as string);
          if (isNaN(offset) || offset < 0) {
            offset = 0;
          }
          const projectId = request.query.projectId as string;
          let jobs: Job[] = [];
          if (projectId) {
            jobs = await Repo.job.methods.findAllByProjectIdAndLimitAndOffset(
              projectId,
              limit,
              offset
            );
          } else {
            jobs = await Repo.job.methods.findAllByLimitAndOffset(
              limit,
              offset
            );
          }
          return {
            jobs: jobs.map((e) => JobFactory.toLite(e)),
            limit,
            offset,
            nextUri: `/job/all?limit=${limit}&offset=${offset + 1}`,
          };
        },
      }),
      getOne: createControllerMethod<unknown, { job: Job }>({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ
        ),
        async handler({ request, errorHandler }) {
          const job = await Repo.job.findById(request.params.id);
          if (!job) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Job with ID "${request.params.id}" does not exist.`
            );
          }
          return { job };
        },
      }),
    };
  },
});
