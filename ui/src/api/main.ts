import { JobHandler } from './job';
import { ProjectHandler } from './project';

class Api {
  job = new JobHandler();
  project = new ProjectHandler();
}

export const api = new Api();
