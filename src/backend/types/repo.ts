import type { JobRepo } from '.';
import type { ProjectRepo } from './project';

export interface Repo {
  project: ProjectRepo;
  job: JobRepo;
}
