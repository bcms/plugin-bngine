import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface ProjectVar {
  key: string;
  value: string;
}

export const ProjectVarSchema: ObjectSchema = {
  key: {
    __type: 'string',
    __required: true,
  },
  value: {
    __type: 'string',
    __required: true,
  },
};
