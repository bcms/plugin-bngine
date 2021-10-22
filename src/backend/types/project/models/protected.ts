import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';
import { ProjectRunCmd, ProjectVar } from '.';

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
