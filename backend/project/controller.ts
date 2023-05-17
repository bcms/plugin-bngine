import * as path from 'path';
import {
  createController,
  createControllerMethod,
  useFS,
  useLogger,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, ObjectSchema } from '@becomes/purple-cheetah/types';
import { Repo } from '../repo';
import { ProjectHelper, System } from '../util';
import { createProjectRepo } from './repository';
import {
  ProjectGitRepo,
  ProjectGitRepoSchema,
  ProjectProtected,
  ProjectRunCmd,
  ProjectRunCmdSchema,
  ProjectVar,
  ProjectVarSchema,
} from './models';
import type {
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSRouteProtectionJwtResult,
} from '@becomes/cms-backend/src/types';
import { BCMSRouteProtection } from '@becomes/cms-backend/src/util';
import { ProjectFactory } from './factory';

export interface ProjectCreateBody {
  name: string;
  repo: ProjectGitRepo;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}
export const ProjectCreateBodySchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  repo: {
    __type: 'object',
    __required: true,
    __child: ProjectGitRepoSchema,
  },
  vars: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: ProjectVarSchema,
    },
  },
  run: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: ProjectRunCmdSchema,
    },
  },
};

export interface ProjectUpdateBody {
  id: string;
  name?: string;
  repo?: ProjectGitRepo;
  vars?: ProjectVar[];
  run?: ProjectRunCmd[];
}
export const ProjectUpdateBodySchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: false,
  },
  repo: {
    __type: 'object',
    __required: false,
    __child: ProjectGitRepoSchema,
  },
  vars: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: ProjectVarSchema,
    },
  },
  run: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: ProjectRunCmdSchema,
    },
  },
};

export const ProjectController = createController({
  name: 'Project controller',
  path: '/project',
  async setup({ controllerName }) {
    const logger = useLogger({ name: controllerName });
    createProjectRepo();
    const projects = await Repo.project.findAll();
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      try {
        await ProjectHelper.setupProjectFS(project);
      } catch (error) {
        const err = error as Error;
        // Do nothing
        logger.warn('setup', {
          project: project._id,
          error: {
            message: err.message,
            stack: err.stack ? err.stack.split('\n') : [],
          },
        });
      }
    }
  },
  methods() {
    const fs = useFS();
    return {
      getAll: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { projects: ProjectProtected[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ
        ),
        async handler() {
          const projects = await Repo.project.findAll();
          return {
            projects: projects.map((e) => ProjectFactory.toProtected(e)),
          };
        },
      }),

      getById: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { project: ProjectProtected }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ
        ),
        async handler({ request, errorHandler }) {
          const project = await Repo.project.findById(request.params.id);
          if (!project) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Project with ID "${request.params.id}" does not exist.`
            );
          }
          return { project: ProjectFactory.toProtected(project) };
        },
      }),

      create: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<ProjectCreateBody>,
        { project: ProjectProtected }
      >({
        type: 'post',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: ProjectCreateBodySchema,
          }),
        async handler({ body, errorHandler, logger }) {
          const project = ProjectFactory.instance({
            name: body.name,
            repo: body.repo,
            vars: body.vars,
            run: body.run,
          });
          if (
            !project.repo.url.startsWith('http') &&
            !project.repo.url.startsWith('git@')
          ) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              `Invalid repository URL. Example: https://github.com/USER/REPO or git@github.com:USER/REPO`
            );
          }
          const addProject = await Repo.project.add(project);
          try {
            await ProjectHelper.setupProjectFS(addProject);
          } catch (error) {
            const err = error as Error;
            logger.warn('create', err);
            await Repo.project.deleteById(addProject._id);
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              err.message
            );
          }
          return { project: ProjectFactory.toProtected(addProject) };
        },
      }),

      update: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<ProjectUpdateBody>,
        { project: ProjectProtected }
      >({
        type: 'put',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: ProjectUpdateBodySchema,
          }),
        async handler({ errorHandler, body }) {
          const project = await Repo.project.findById(body.id);
          if (!project) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Project with ID "${body.id}" does not exist`
            );
          }
          const data = body;
          let changeDetected = false;
          let sshKeyChanged = false;
          let repoUrlChanged = false;
          if (data.name && project.name !== data.name) {
            changeDetected = true;
            const projectWithSameName = await Repo.project.methods.findByName(
              data.name
            );
            if (projectWithSameName) {
              throw errorHandler.occurred(
                HTTPStatus.NOT_FOUNT,
                `Project with name "${data.name}" already exist`
              );
            }
            project.name = data.name;
          }
          if (data.repo) {
            if (data.repo.name && data.repo.name !== project.repo.name) {
              changeDetected = true;
              project.repo.name = data.repo.name;
            }
            if (data.repo.url && data.repo.url !== project.repo.url) {
              changeDetected = true;
              repoUrlChanged = true;
              project.repo.url = data.repo.url;
            }
            if (data.repo.branch && data.repo.branch !== project.repo.branch) {
              changeDetected = true;
              project.repo.branch = data.repo.branch;
            }
            if (data.repo.sshKey && data.repo.sshKey !== project.repo.sshKey) {
              changeDetected = true;
              sshKeyChanged = true;
              project.repo.sshKey = data.repo.sshKey;
            }
          }
          if (data.run) {
            changeDetected = true;
            project.run = data.run;
          }
          if (data.vars) {
            changeDetected = true;
            project.vars = data.vars;
          }
          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              `Nothing has changed in project`
            );
          }
          if (sshKeyChanged) {
            await fs.save(
              path.join(
                process.cwd(),
                'bngine-workspace',
                project._id,
                '.ssh',
                'key'
              ),
              project.repo.sshKey || ''
            );
          }
          if (repoUrlChanged) {
            await fs.deleteDir(
              path.join(process.cwd(), 'bngine-workspace', project._id, 'git')
            );
            await ProjectHelper.cloneRepo(project);
          }
          return {
            project: ProjectFactory.toProtected(
              await Repo.project.update(project)
            ),
          };
        },
      }),

      delete: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { status: boolean }
      >({
        path: '/:id',
        type: 'delete',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.ADMIN],
          JWTPermissionName.DELETE
        ),
        async handler({ request, errorHandler }) {
          const project = await Repo.project.findById(request.params.id);
          if (!project) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Project with ID "${request.params.id}" does not exist.`
            );
          }
          return {
            status: await Repo.project.deleteById(request.params.id),
          };
        },
      }),

      listDirectory: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { files: string[] }
      >({
        path: 'directory/:id',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.ADMIN],
          JWTPermissionName.READ
        ),
        async handler({ request, errorHandler }) {
          const project = await Repo.project.findById(request.params.id);
          if (!project) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Project with ID "${request.params.id}" does not exist.`
            );
          }
          if (!(await fs.exist(project.name))) {
            return {
              files: [],
            };
          }
          const files = await fs.readdir(project.name);
          return { files };
        },
      }),

      getBranches: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { branches: string[] }
      >({
        path: '/:projectId/branches',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.ADMIN],
          JWTPermissionName.READ
        ),
        async handler({ request, errorHandler }) {
          const project = await Repo.project.findById(request.params.projectId);
          if (!project) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Project with ID "${request.params.id}" does not exist.`
            );
          }
          try {
            await ProjectHelper.pullRepo(project);
          } catch (error) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              (error as Error).message
            );
          }
          let data = '';
          try {
            await System.exec(
              [
                `cd bngine-workspace/${project._id}/git`,
                '&&',
                `git branch -a | grep origin`,
              ].join(' '),
              (type, chunk) => {
                process[type].write(chunk);
                data += chunk;
              }
            );
          } catch (error) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              (error as Error).message
            );
          }
          const branches = data
            .replace(/remotes\/origin\//g, '')
            .replace(/ {2}/g, '')
            .split('\n')
            .filter((e) => e !== '' && !e.includes('HEAD'));
          return {
            branches,
          };
        },
      }),
    };
  },
});
