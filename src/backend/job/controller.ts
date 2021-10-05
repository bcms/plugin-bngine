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
      getAllLite: createControllerMethod<unknown, { jobs: JobLite[] }>({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ
        ),
        async handler({ request }) {
          const jobs = await Repo.job.methods.findAllByLimitAndOffset(
            parseInt(request.params.limit),
            parseInt(request.params.offset)
          );
          return {
            jobs: jobs.map((e) => JobFactory.toLite(e)),
          };
        },
      }),
      getAllLiteForProject: createControllerMethod<
        unknown,
        { jobs: JobLite[] }
      >({
        path: '/:projectId/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ
        ),
        async handler({ request, errorHandler }) {
          const projectId = await Repo.project.findById(
            request.params.projectId
          );
          if (!projectId) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Project with ID "${request.params.id}" does not exist.`
            );
          }
          const jobs = await Repo.job.methods.findAllByProjectIdAndLimitAndOffset(
            `${projectId}`,
            parseInt(request.params.limit),
            parseInt(request.params.offset)
          );
          return {
            jobs: jobs.map((e) => JobFactory.toLite(e)),
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
