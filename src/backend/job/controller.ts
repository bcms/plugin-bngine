import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWT,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import { createJobRepo, JobFactory } from '.';
import { createBngine } from '../bngine';
import { Repo } from '../repo';
import {
  Bngine,
  BodyCheckerOutput,
  Job,
  JobCross,
  JobLite,
  JobStatus,
  ProjectVar,
  ProjectVarFSDBSchema,
} from '../types';
import { createBodyCheckerAndJwtChecker, IDUtil } from '../util';
import type { BCMSUserCustomPool } from '@becomes/cms-backend/types';

interface Setup {
  bngine: Bngine;
}

interface StartAJobData {
  projectId: string;
  branch?: string;
  vars?: ProjectVar[];
}

export const JobController = createController<Setup>({
  name: 'Job controller',
  path: '/job',
  async setup() {
    const bngine = await createBngine();
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
        await Repo.job.update(job as JobCross);
      } else {
        job.pipe = [];
        job.status = JobStatus.QUEUE;
        const updatedJob = await Repo.job.update(job as JobCross);
        bngine.start(updatedJob, project);
      }
    }
    return {
      bngine,
    };
  },
  methods({ bngine }) {
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
        BodyCheckerOutput<StartAJobData> & {
          accessToken: JWT<BCMSUserCustomPool>;
        },
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
            vars: {
              __type: 'array',
              __required: false,
              __child: {
                __type: 'object',
                __content: ProjectVarFSDBSchema,
              },
            },
          },
          roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permission: JWTPermissionName.EXECUTE,
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
          });
          const addedJob = await Repo.job.add(job as JobCross);

          if (project.run.length > 0) {
            bngine.start(job, project, body.vars);
          }
          return {
            job: addedJob,
          };
        },
      }),
    };
  },
});
