import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import {
  ProjectGitRepo,
  ProjectGitRepoFSDBSchema,
  ProjectGitRepoMongoDBSchema,
} from './git-repo';
import {
  ProjectRunCmd,
  ProjectRunCmdFSDBSchema,
  ProjectRunCmdMongoDBSchema,
} from './run-cmd';
import {
  ProjectVar,
  ProjectVarFSDBSchema,
  ProjectVarMongoDBSchema,
} from './var';

export interface Project extends FSDBEntity {
  name: string;
  repo: ProjectGitRepo;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}

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

export const ProjectMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  name: String,
  repo: ProjectGitRepoMongoDBSchema,
  vars: [ProjectVarMongoDBSchema],
  run: [ProjectRunCmdMongoDBSchema],
});
