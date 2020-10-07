import type { Entity, IEntity, ObjectSchema } from '@becomes/purple-cheetah';
import { Schema, Types } from 'mongoose';

export enum JobStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  RUNNING = 'RUNNING',
  QUEUE = 'QUEUE',
}
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
export interface IJob extends IEntity {
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
export class Job implements Entity {
  constructor(
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public finishedAt: number,
    public inQueueFor: number,
    public repo: {
      name: string;
      branch: string;
    },
    public running: boolean,
    public status: JobStatus,
    public project: string,
    public pipe: JobPipe[],
  ) {}

  static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      finishedAt: Number,
      inQueueFor: Number,
      repo: Object,
      running: Boolean,
      status: String,
      project: String,
      pipe: [Object],
    });
  }
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

export const JobSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  createdAt: {
    __type: 'number',
    __required: true,
  },
  updatedAt: {
    __type: 'number',
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
      __content: JobPipeSchema,
    },
  },
};
