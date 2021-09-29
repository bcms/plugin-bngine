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
import type { ProjectProtected } from '../types';
import { createProjectRepo } from './repository';

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
    };
  },
});
