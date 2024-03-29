import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export const JobPipeFSDBSchema: ObjectSchema = {
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

export const JobPipeMongoDBSchema = new Schema({
  id: String,
  createdAt: Number,
  timeToExec: Number,
  title: String,
  cmd: String,
  ignoreIfFail: Boolean,
  stdout: String,
  stderr: String,
  status: String,
});
