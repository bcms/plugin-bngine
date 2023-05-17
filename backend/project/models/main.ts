import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { ProjectGitRepo, ProjectGitRepoSchema } from './git-repo';
import { ProjectRunCmd, ProjectRunCmdSchema } from './run-cmd';
import { ProjectVar, ProjectVarSchema } from './var';

export interface Project extends FSDBEntity {
  name: string;
  repo: ProjectGitRepo;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}

export interface ProjectProtected extends Omit<Project, 'repo'> {
  repo: {
    name: string;
    url: string;
    branch: string;
  };
}

export const ProjectSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  name: {
    __type: 'string',
    __required: true,
  },
  repo: {
    __type: 'object',
    __required: true,
    __child: ProjectGitRepoSchema,
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
