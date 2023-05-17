import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import type { JobStatus } from './main';

export interface JobPipe {
  id: string;
  createdAt: number;
  timeToExec: number;
  title: string;
  cmd: string;
  ignoreIfFail: boolean;
  stdout: string; // --> pointer to file (ex. bcms_storage/bngine/2021-09-07/{PIPE_ID}_out)
  stderr: string; // --> pointer to file (ex. bcms_storage/bngine/2021-09-07/{PIPE_ID}_err)
  status: JobStatus;
}

export const JobPipeSchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
  createdAt: {
    __type: 'number',
    __required: true,
  },
  timeToExec: {
    __type: 'number',
    __required: true,
  },
  cmd: {
    __type: 'string',
    __required: true,
  },
  ignoreIfFail: {
    __type: 'string',
    __required: true,
  },
  stdout: {
    __type: 'string',
    __required: true,
  },
  stderr: {
    __type: 'string',
    __required: true,
  },
  status: {
    __type: 'string',
    __required: true,
  },
};
