import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import { JobPipe, JobPipeFSDBSchema, JobPipeMongoDBSchema } from './pipe';

// eslint-disable-next-line no-shadow
export enum JobStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  RUNNING = 'RUNNING',
  QUEUE = 'QUEUE',
  CANCELED = 'CANCELED',
}

export interface Job extends FSDBEntity {
  userId: string;
  finishedAt: number;
  inQueueFor: number;
  repo: {
    name: string;
    branch: string;
  };
  running: boolean;
  status: JobStatus;
  project: string;
  pipe: JobPipe[];
}

export const JobFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  userId: {
    __type: 'string',
    __required: true,
  },
  finishedAt: {
    __type: 'number',
    __required: true,
  },
  inQueueFor: {
    __type: 'number',
    __required: true,
  },
  repo: {
    __type: 'object',
    __required: true,
    __child: {
      name: {
        __type: 'string',
        __required: true,
      },
      branch: {
        __type: 'string',
        __required: true,
      },
    },
  },
  running: {
    __type: 'boolean',
    __required: true,
  },
  status: {
    __type: 'string',
    __required: true,
  },
  project: {
    __type: 'string',
    __required: true,
  },
  pipe: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: JobPipeFSDBSchema,
    },
  },
};

export const JobMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  userId: String,
  finishedAt: Number,
  inQueueFor: Number,
  repo: {
    type: new Schema({
      name: String,
      branch: String,
    }),
  },
  running: Boolean,
  status: String,
  project: String,
  pipe: [JobPipeMongoDBSchema],
});
