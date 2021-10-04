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

    // TODO: Loop over all project and check if FS is setup.
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      ProjectHelper.setupProjectFS(project);
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
          // TODO: 1. Check if /bngine-workspace/{project_id} exists - If not, create dir
          // TODO: 2. Check if SSH key is present in a Project.
          // TODO: 2.1 If it is present, save it to file /bngine-workspace/{project_id}/.ssh/key
          //            After that, change file mode to 600 (chmod 600 /bngine-workspace/{project_id}/.ssh/key)
          // TODO: 2.2 If not, skip
          // TODO: 3. Check if /bngine-workspace/{project_id}/git exists
          // TODO: 3.1 If it does exist, skip
          // TODO: 3.2 If it does not exist:
          // TODO: 3.2.1 SSH Key is available - Check if URL is SSH compatible.
          //              If it is clone repo with SSH key
          //              (git clone URL --config ssh.coreCommand="ssh -i /app/bngine-workspace/{project_id}/.ssh/key")
          // TODO: 3.2.2 SSH Key is not available - Clone normally (git clone {URL})
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
          // if (!(await fs.exist(path.join(process.cwd(), 'bngine-workspace')))) {
          //   await util.promisify(fsSystem.mkdir)(
          //     path.join(process.cwd(), 'bngine-workspace')
          //   );
          // }
          // // TODO: 1. Check if /bngine-workspace/{project_id} exists - If not, create dir
          // // TODO: 2. Check if SSH key is present in a Project.
          // // TODO: 2.1 If it is present, save it to file /bngine-workspace/{project_id}/.ssh/key
          // //            After that, change file mode to 600 (chmod 600 /bngine-workspace/{project_id}/.ssh/key)
          // // TODO: 2.2 If not, skip
          // // TODO: 3. Check if /bngine-workspace/{project_id}/git exists
          // // TODO: 3.1 If it does exist, skip
          // // TODO: 3.2 If it does not exist:
          // // TODO: 3.2.1 SSH Key is available - Check if URL is SSH compatible.
          // //              If it is clone repo with SSH key
          // //              (git clone URL --config ssh.coreCommand="ssh -i /app/bngine-workspace/{project_id}/.ssh/key")
          // // TODO: 3.2.2 SSH Key is not available - Clone normally (git clone {URL})
          // if (
          //   !(await fs.exist(
          //     path.join(process.cwd(), 'bngine-workspace', project._id)
          //   ))
          // ) {
          //   if (!project.repo.url) {
          //     throw errorHandler.occurred(
          //       HTTPStatus.FORBIDDEN,
          //       `Project "${project._id}" does not have repository URL set.`
          //     );
          //   }
          //   try {
          //     await System.exec(
          //       `cd bngine-workspace/${project._id} && git clone ${project.repo.url} ${project._id}`,
          //       (type, chunk) => {
          //         process[type].write(chunk);
          //       }
          //     );
          //   } catch (error) {
          //     throw errorHandler.occurred(
          //       HTTPStatus.INTERNAL_SERVER_ERROR,
          //       (error as Error).message
          //     );
          //   }
          // }

          try {
            await System.exec(
              `cd ${path.join(
                process.cwd(),
                // TODO: Check path
                'bngine-workspace',
                project._id
              )} && git pull`,
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
              `cd ${path.join(
                process.cwd(),
                'bngine-workspace',
                project._id
              )} && git branch -a | grep origin`,
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
            branches: branches,
          };
        },
      }),
    };
  },
});
