import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { Repo } from '../repo';
import { ProjectFactory } from './factory';
import { createProjectRepo } from './repository';

export const ProjectController = createController({
  name: 'Project controller',
  path: '/bngine/project',
  setup() {
    createProjectRepo();
  },
  methods() {
    return {
      getAll: createControllerMethod({
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
    };
  },
});
