import type { ObjectSchema } from '@becomes/purple-cheetah';

export interface BngineStartJobData {
  branch?: string;
  vars?: Array<{
    key: string;
    value: string;
  }>;
}

export const BngineStartJobDataSchema: ObjectSchema = {
  branch: {
    __type: 'string',
    __required: false,
  },
  vars: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: {
        key: {
          __type: 'string',
          __required: true,
        },
        value: {
          __type: 'string',
          __required: true,
        },
      },
    },
  },
};
