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
import { createBodyCheckerAndJwtChecker } from '../util';
import { createProjectRepo } from './repository';
interface CreateBody {
  name: string;
  repo: ProjectGitRepo;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}
export const ProjectController = createController({
  name: 'Project controller',
  path: '/bngine/project',
  setup() {
    createProjectRepo();
  },
  methods() {
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
    };
  },
});
