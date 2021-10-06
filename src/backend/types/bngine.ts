import type { Job, Project, ProjectVar } from '.';

export interface Bngine {
  start(job: Job, project: Project, vars?: ProjectVar[]): void;
}
