import type { JobRepo } from './job';
import type { ProjectRepo } from './project';

export interface Repo {
  project: ProjectRepo;
  job: JobRepo;
}
