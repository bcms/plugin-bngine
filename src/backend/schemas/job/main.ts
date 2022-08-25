import { FSDBEntitySchema } from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import { JobPipeFSDBSchema, JobPipeMongoDBSchema } from './pipe';

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
