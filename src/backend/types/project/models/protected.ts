import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { ProjectRunCmd, ProjectVar } from './main';

export interface ProjectRepoProtected {
  name: string;
  url: string;
  branch: string;
}

export interface ProjectProtected extends FSDBEntity {
  name: string;
  repo: ProjectRepoProtected;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}
