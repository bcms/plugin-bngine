import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import type { JobStatus } from './main';

export interface JobPipe {
  id: string;
  createdAt: number;
  timeToExec: number;
  title: string;
  cmd: string;
  ignoreIfFail: boolean;
  out: string;
  err: string;
  status: JobStatus;
}

export const JobPipeFSDBSchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
  createAt: {
    __type: 'number',
    __required: true,
  },
  timeToExec: {
    __type: 'number',
    __required: true,
  },
  title: {
    __type: 'string',
    __required: true,
  },
  cmd: {
    __type: 'string',
    __required: true,
  },
  ignoreIfFail: {
    __type: 'boolean',
    __required: true,
  },
  out: {
    __type: 'string',
    __required: true,
  },
  err: {
    __type: 'string',
    __required: true,
  },
  status: {
    __type: 'string',
    __required: true,
  },
};

export const JobPipeMongoDBSchema = new Schema({
  id: String,
  createdAt: Number,
  timeToExec: Number,
  title: String,
  cmd: String,
  ignoreIfFail: Boolean,
  out: String,
  err: String,
  status: String,
});
