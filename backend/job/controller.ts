import * as path from 'path';
import {
  createController,
  createControllerMethod,
  useFS,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, ObjectSchema } from '@becomes/purple-cheetah/types';
import { Repo } from '../repo';
import { IDUtil } from '../util';
import type {
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSRouteProtectionJwtResult,
} from '@becomes/cms-backend/types';
import { BCMSConfig } from '@becomes/cms-backend/config';
import { ProjectVar, ProjectVarSchema } from '../project';
import { createJobRepo } from './repository';
import { Job, JobLite, JobStatus } from './models';
import { bngine } from '../bngine';
import { BCMSRouteProtection } from '@becomes/cms-backend/src/util';
import { JobFactory } from './factory';

export interface JobStartBody {
  projectId: string;
  branch?: string;
  vars?: ProjectVar[];
}
export const JobStartBodySchema: ObjectSchema = {
  projectId: {
    __type: 'string',
    __required: true,
  },
  branch: {
    __type: 'string',
    __required: false,
  },
  vars: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: ProjectVarSchema,
    },
  },
};

export const JobController = createController({
  name: 'Job controller',
  path: '/job',
  async setup() {
    createJobRepo();
    const runningJobs = await Repo.job.methods.findAllByStatus(
      JobStatus.RUNNING
    );
    const queueJobs = await Repo.job.methods.findAllByStatus(JobStatus.QUEUE);
    runningJobs.sort((a, b) => b.createdAt - a.createdAt);
    queueJobs.sort((a, b) => b.createdAt - a.createdAt);
    const jobs = [...runningJobs, ...queueJobs];
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const project = await Repo.project.findById(job.project);
      if (!project) {
        job.status = JobStatus.FAIL;
        job.pipe = [
          {
            cmd: 'unknown',
            createdAt: Date.now(),
            id: IDUtil.create(),
            ignoreIfFail: false,
            status: JobStatus.SUCCESS,
            stderr: `Project with ID "${job.project}" does not exist and job cannot be started because of that.`,
            stdout: '',
            timeToExec: 0,
            title: 'Failed to get project',
          },
        ];
        await Repo.job.update(job);
      } else {
        job.pipe = [];
        job.status = JobStatus.QUEUE;
        const updatedJob = await Repo.job.update(job);
        bngine.start(updatedJob, project);
      }
    }
    return {
      fs: useFS({
        base: BCMSConfig.local
          ? path.join(process.cwd(), 'storage', 'bngine')
          : '/bcms-share/bngine',
      }),
    };
  },
  methods({ fs }) {
    return {
      getAllLite: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { jobs: JobLite[]; limit: number; offset: number; nextUri: string }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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

      count: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ
        ),
        async handler() {
          return {
            count: await Repo.job.count(),
          };
        },
      }),

      getOne: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { job: Job }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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

      getPipeLogs: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { stderr: string; stdout: string }
      >({
        path: '/:id/log/:pipeId',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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
          const pipe = job.pipe.find((e) => e.id === request.params.pipeId);
          if (!pipe) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Pipe with ID "${request.params.pipeId}" does not exist.`
            );
          }
          let stdout = '';
          let stderr = '';
          if (await fs.exist(pipe.stdout.split('/'), true)) {
            stdout = await fs.readString(pipe.stdout);
          }
          if (await fs.exist(pipe.stderr.split('/'), true)) {
            stderr = await fs.readString(pipe.stderr);
          }
          return { stderr, stdout };
        },
      }),

      startAJob: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<JobStartBody>,
        { job: Job }
      >({
        path: '/start',
        type: 'post',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.EXECUTE,
            bodySchema: JobStartBodySchema,
          }),
        async handler({ body, errorHandler, accessToken }) {
          const project = await Repo.project.findById(body.projectId);
          if (!project) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Project with ID "${body.projectId}" does not exist.`
            );
          }
          const job = JobFactory.instance({
            project: body.projectId,
            status:
              project.run.length > 0 ? JobStatus.QUEUE : JobStatus.SUCCESS,
            userId: accessToken.payload.userId,
            repo: {
              branch:
                typeof body.branch === 'string'
                  ? body.branch
                  : project.repo.branch,
              name: project.repo.name,
            },
            finishedAt: -1,
            inQueueFor: -1,
            pipe: [],
            running: false,
          });
          const addedJob = await Repo.job.add(job);
          if (project.run.length > 0) {
            bngine.start(job, project, body.vars);
          } else {
            addedJob.status = JobStatus.SUCCESS;
            addedJob.running = false;
            addedJob.finishedAt = Date.now();
            addedJob.inQueueFor = 0;

            await Repo.job.update(addedJob);
          }

          return {
            job: addedJob,
          };
        },
      }),
    };
  },
});
