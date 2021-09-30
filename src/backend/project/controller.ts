import * as path from 'path';
import * as fsSystem from 'fs';
import * as util from 'util';
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
import { createBodyCheckerAndJwtChecker, System } from '../util';
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
  setup() {
    createProjectRepo();

    return {
      fs: useFS(),
    };
  },
  methods({ fs }) {
    return {
      getAll: createControllerMethod<unknown, ProjectProtected[]>({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ
        ),
        async handler() {
          const projects = await Repo.project.findAll();
          return projects.map((e) => ProjectFactory.toProtected(e));
        },
      }),
      getOne: createControllerMethod<unknown, ProjectProtected>({
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
          return ProjectFactory.toProtected(project);
        },
      }),
      create: createControllerMethod<
        BodyCheckerOutput<CreateBody>,
        ProjectProtected
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
          return ProjectFactory.toProtected(addProject);
        },
      }),

      update: createControllerMethod<
        BodyCheckerOutput<UpdateBody>,
        ProjectProtected
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
            if (data.repo.name) {
              changeDetected = true;
              project.repo.name = data.repo.name;
            }
            if (data.repo.url) {
              changeDetected = true;
              project.repo.url = data.repo.url;
            }
            if (data.repo.branch) {
              changeDetected = true;
              project.repo.branch = data.repo.branch;
            }
            if (data.repo.sshKey) {
              changeDetected = true;
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
          const updatedProject = await Repo.project.update(project);
          return ProjectFactory.toProtected(updatedProject);
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
          // 1. Get project
          const project = await Repo.project.findById(request.params.projectId);
          if (!project) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Project with ID "${request.params.id}" does not exist.`
            );
          }
          // 2. Proveriti da li postoji projekat u workspace-u
          // 2.1 Ne postoji workspace - Kreiraj workspace dir (bngine-workspace)
          if (!(await fs.exist(path.join(process.cwd(), 'bngine-workspace')))) {
            console.log('HERE');
            await util.promisify(fsSystem.mkdir)(
              path.join(process.cwd(), 'bngine-workspace')
            );
          }

          // 2.2 Clone github repository to workspace (bngine-workspace/projectID) - git clone {URL} {projectID}
          if (
            !(await fs.exist(
              path.join(process.cwd(), 'bngine-workspace', project._id)
            ))
          ) {
            if (!project.repo.url) {
              throw errorHandler.occurred(
                HTTPStatus.FORBIDDEN,
                `Project "${project._id}" does not have repository URL set.`
              );
            }
            try {
              await System.exec(
                `cd bngine-workspace && git clone ${project.repo.url} ${project._id}`,
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
          }
          // 3. Pull repository - cd bngine-workspace/projectID && git pull
          // 4. Get repository branches - git branch -a | grep "origin"
          // 5. Parse process output to string array
          // 6. Return branches

          return {
            branches: [],
          };
        },
      }),
    };
  },
});
