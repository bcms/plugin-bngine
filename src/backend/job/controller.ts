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
import type { BodyCheckerOutput, Job, JobCross, JobLite } from '../types';
import { createBodyCheckerAndJwtChecker } from '../util';

interface StartAJobData {
  projectId: string;
  branch?: string;
}

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
            nextUri: `/job/all?limit=${limit}&offset=${offset + 1}${
              projectId ? `&projectId=${projectId}` : ''
            }`,
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

      startAJob: createControllerMethod<
        BodyCheckerOutput<StartAJobData>,
        { job: Job }
      >({
        path: '/start',
        type: 'post',
        preRequestHandler: createBodyCheckerAndJwtChecker<StartAJobData>({
          schema: {
            projectId: {
              __type: 'string',
              __required: true,
            },
            branch: {
              __type: 'string',
              __required: false,
            },
          },
          roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permission: JWTPermissionName.EXECUTE,
        }),
        async handler({ body, errorHandler }) {
          const project = await Repo.project.findById(body.projectId);
          if (!project) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Project with ID "${body.projectId}" does not exist.`
            );
          }
          const job = JobFactory.instance({
            project: body.projectId,
            repo: {
              branch:
                typeof body.branch === 'string'
                  ? body.branch
                  : project.repo.branch,
              name: project.repo.name,
            },
          });
          const addedJob = await Repo.job.add(job as JobCross);
          // TODO: Add job to queue
          const queue = createQueue({ name: 'Pera' });
          const queueItem = queue({
            name: 'Lol',
            handler: () => {
              console.log('Test');
            },
          });
          await queueItem.wait
          return {
            job: addedJob,
          };
        },
      }),
    };
  },
});
