import type { ObjectSchema } from '@becomes/purple-cheetah';
import {
  ProjectRunCmd,
  ProjectVar,
  ProjectVarSchema,
  ProjectRunCmdSchema,
} from '../../models';

export interface UpdateProjectData {
  _id: string;
  name?: string;
  repo?: {
    name?: string;
    url?: string;
    branch?: string;
    sshKey?: string;
  };
  vars?: ProjectVar[];
  run?: ProjectRunCmd[];
}

export const UpdateProjectDataSchema: ObjectSchema = {
  _id: {
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
    __child: {
      name: {
        __type: 'string',
        __required: false,
      },
      url: {
        __type: 'string',
        __required: false,
      },
      branch: {
        __type: 'string',
        __required: false,
      },
      sshKey: {
        __type: 'string',
        __required: false,
      },
    },
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
