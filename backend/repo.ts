import type { JobRepo } from './job';
import type { ProjectRepo } from './project';

export class Repo {
  static job: JobRepo;
  static project: ProjectRepo;
}
