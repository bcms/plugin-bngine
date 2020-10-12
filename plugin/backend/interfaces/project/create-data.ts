import type { ObjectSchema } from '@becomes/purple-cheetah';
import {
  ProjectGitRepo,
  ProjectRunCmd,
  ProjectVar,
  ProjectRepoSchema,
  ProjectVarSchema,
  ProjectRunCmdSchema,
} from '../../models';

export interface CreateProjectData {
  name: string;
  repo: ProjectGitRepo;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}

export const CreateProjectDataSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  repo: {
    __type: 'object',
    __required: true,
    __child: ProjectRepoSchema,
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
