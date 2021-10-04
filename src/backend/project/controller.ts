import * as path from 'path';
import {
  createController,
  createControllerMethod,
  useFS,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { FS, HTTPStatus } from '@becomes/purple-cheetah/types';
import { ProjectFactory } from '.';
import { Repo } from '../repo';
import {
  BodyCheckerOutput,
  ProjectGitRepo,
  ProjectGitRepoFSDBSchema,
  ProjectProtected,
  ProjectRunCmd,
  ProjectRunCmdFSDBSchema,
  ProjectVar,
  ProjectVarFSDBSchema,
} from '../types';
import { createBodyCheckerAndJwtChecker, ProjectHelper, System } from '../util';
import { createProjectRepo } from './repository';

interface Setup {
  fs: FS;
}
interface CreateBody {
  name: string;
  repo: ProjectGitRepo;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}
interface UpdateBody {
  id: string;
  name: string;
  repo: ProjectGitRepo;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}

export const ProjectController = createController<Setup>({
  name: 'Project controller',
  path: '/project',
  async setup() {
    createProjectRepo();
    const projects = await Repo.project.findAll();
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      await ProjectHelper.setupProjectFS(project);
    }

    return {
      fs: useFS(),
    };
  },
  methods({ fs }) {
    return {
      getAll: createControllerMethod<unknown, { projects: ProjectProtected[] }>(
        {
          path: '/all',
          type: 'get',
          preRequestHandler: createJwtProtectionPreRequestHandler(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ
          ),
          async handler() {
            const projects = await Repo.project.findAll();
            return {
              projects: projects.map((e) => ProjectFactory.toProtected(e)),
            };
          },
        }
      ),
      getOne: createControllerMethod<unknown, { project: ProjectProtected }>({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
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
        BodyCheckerOutput<CreateBody>,
        { project: ProjectProtected }
      >({
        type: 'post',
        preRequestHandler: createBodyCheckerAndJwtChecker<CreateBody>({
          schema: {
            name: {
              __type: 'string',
              __required: true,
            },
            repo: {
              __type: 'object',
              __required: true,
              __child: ProjectGitRepoFSDBSchema,
            },
            vars: {
              __type: 'array',
              __required: true,
              __child: {
                __type: 'object',
                __content: ProjectVarFSDBSchema,
              },
            },
            run: {
              __type: 'array',
              __required: true,
              __child: {
                __type: 'object',
                __content: ProjectRunCmdFSDBSchema,
              },
            },
          },
          roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permission: JWTPermissionName.WRITE,
        }),
        async handler({ body }) {
          const addProject = await Repo.project.add({
            _id: '',
            createdAt: 0,
            updatedAt: 0,
            name: body.name,
            repo: body.repo,
            vars: body.vars,
            run: body.run,
          });
          await ProjectHelper.setupProjectFS(addProject);
          return { project: ProjectFactory.toProtected(addProject) };
        },
      }),

      update: createControllerMethod<
        BodyCheckerOutput<UpdateBody>,
        { project: ProjectProtected }
      >({
        type: 'put',
        preRequestHandler: createBodyCheckerAndJwtChecker({
          schema: {
            id: {
              __type: 'string',
              __required: true,
            },
            name: {
              __type: 'string',
              __required: true,
            },
            repo: {
              __type: 'object',
              __required: true,
              __child: ProjectGitRepoFSDBSchema,
            },
            vars: {
              __type: 'array',
              __required: true,
              __child: {
                __type: 'object',
                __content: ProjectVarFSDBSchema,
              },
            },
            run: {
              __type: 'array',
              __required: true,
              __child: {
                __type: 'object',
                __content: ProjectRunCmdFSDBSchema,
              },
            },
          },
          roles: [JWTRoleName.ADMIN],
          permission: JWTPermissionName.WRITE,
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
              project.repo.sshKey
            );
          }
          if (repoUrlChanged) {
            await fs.deleteDir(
              path.join(process.cwd(), 'bngine-workspace', project._id, 'git')
            );
            await ProjectHelper.cloneRepo(project);
          }

          const updatedProject = await Repo.project.update(project);
          return { project: ProjectFactory.toProtected(updatedProject) };
        },
      }),

      delete: createControllerMethod<unknown, { status: boolean }>({
        path: '/:id',
        type: 'delete',
        preRequestHandler: createJwtProtectionPreRequestHandler(
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
          const deleteProject = await Repo.project.deleteById(
            request.params.id
          );
          return {
            status: deleteProject,
          };
        },
      }),

      listDirectory: createControllerMethod<unknown, { files: string[] }>({
        path: 'directory/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
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

      getBranches: createControllerMethod<unknown, { branches: string[] }>({
        path: '/:projectId/branches',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
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
            await System.exec(
              [`cd bngine-workspace/${project._id}/git`, '&&', `git pull`].join(
                ' '
              ),
              (type, chunk) => {
                process[type].write(chunk);
              }
            );
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
