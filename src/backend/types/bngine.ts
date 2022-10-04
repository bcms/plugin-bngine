import type { Project, ProjectVar } from './project';
import type { Job } from './job';

export interface Bngine {
  start(job: Job, project: Project, vars?: ProjectVar[]): void;
}
