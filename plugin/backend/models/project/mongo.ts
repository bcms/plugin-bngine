import type { Entity, IEntity, ObjectSchema } from '@becomes/purple-cheetah';
import { Types, Schema } from 'mongoose';

export interface ProjectGitRepo {
  name: string;
  url: string;
  sshKey: string;
  branch: string;
}

export interface ProjectRepoProtected {
  name: string;
  url: string;
  branch: string;
}

export interface ProjectVar {
  key: string;
  value: string;
}

export interface ProjectRunCmd {
  title?: string;
  command: string;
  ignoreIfFail?: boolean;
}

export interface IProject extends IEntity {
  name: string;
  repo: ProjectGitRepo;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}

export interface ProjectProtected {
  _id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  repo: ProjectRepoProtected;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}

export class Project implements Entity {
  constructor(
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public name: string,
    public repo: ProjectGitRepo,
    public vars: ProjectVar[],
    public run: ProjectRunCmd[],
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      name: String,
      repo: Object,
      vars: [Object],
      run: [Object],
    });
  }
}

export const ProjectRepoSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  url: {
    __type: 'string',
    __required: true,
  },
  sshKey: {
    __type: 'string',
    __required: true,
  },
  branch: {
    __type: 'string',
    __required: true,
  },
};

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

export const ProjectSchema: ObjectSchema = {
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
  name: {
    __type: 'string',
    __required: true,
  },
  repo: {
    __type: 'object',
    __required: true,
    __child: ProjectRepoSchema,
  },
  vars: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: ProjectVarSchema,
    },
  },
  run: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: ProjectRunCmdSchema,
    },
  },
};
