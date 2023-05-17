import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface ProjectRunCmd {
  title?: string;
  command: string;
  ignoreIfFail?: boolean;
}

export const ProjectRunCmdSchema: ObjectSchema = {
  title: {
    __type: 'string',
    __required: false,
  },
  command: {
    __type: 'string',
    __required: true,
  },
  ignoreIfFail: {
    __type: 'boolean',
    __required: false,
  },
};
