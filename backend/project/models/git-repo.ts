import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface ProjectGitRepo {
  name: string;
  url: string;
  sshKey?: string;
  branch: string;
}

export const ProjectGitRepoSchema: ObjectSchema = {
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
    __required: false,
  },
  branch: {
    __type: 'string',
    __required: true,
  },
};
