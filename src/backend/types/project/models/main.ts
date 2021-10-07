import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import {
  MongoDBEntity,
  MongoDBEntitySchema,
} from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface ProjectGitRepo {
  name: string;
  url: string;
  sshKey: string;
  branch: string;
}
export const ProjectGitRepoFSDBSchema: ObjectSchema = {
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
export const ProjectGitRepoMongoDBSchema = new Schema({
  name: String,
  url: String,
  sshKey: String,
  branch: String,
});

export interface ProjectVar {
  key: string;
  value: string;
}
export const ProjectVarFSDBSchema: ObjectSchema = {
  key: {
    __type: 'string',
    __required: true,
  },
  value: {
    __type: 'string',
    __required: true,
  },
};
export const ProjectVarMongoDBSchema = new Schema({
  key: String,
  value: String,
});

export interface ProjectRunCmd {
  title?: string;
  command: string;
  ignoreIfFail?: boolean;
}
export const ProjectRunCmdFSDBSchema: ObjectSchema = {
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
export const ProjectRunCmdMongoDBSchema = new Schema({
  title: String,
  command: String,
  ignoreIfFail: Boolean,
});

export interface ProjectProps {
  name: string;
  repo: ProjectGitRepo;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}

export type ProjectFSDB = FSDBEntity & ProjectProps;
export const ProjectFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  name: {
    __type: 'string',
    __required: true,
  },
  repo: {
    __type: 'object',
    __required: true,
    __child: ProjectGitRepoFSDBSchema,
  },
  vars: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: ProjectVarFSDBSchema,
    },
  },
  run: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: ProjectRunCmdFSDBSchema,
    },
  },
};

export type ProjectMongoDB = MongoDBEntity & ProjectProps;
export const ProjectMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  name: String,
  repo: ProjectGitRepoMongoDBSchema,
  vars: [ProjectVarMongoDBSchema],
  run: [ProjectRunCmdMongoDBSchema],
});

export type Project = ProjectFSDB | ProjectMongoDB;
export type ProjectCross = ProjectFSDB & ProjectMongoDB;
