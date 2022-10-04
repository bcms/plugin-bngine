import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { ProjectGitRepo } from './git-repo';
import type { ProjectRunCmd } from './run-cmd';
import type { ProjectVar } from './var';

export interface Project extends FSDBEntity {
  name: string;
  repo: ProjectGitRepo;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}
