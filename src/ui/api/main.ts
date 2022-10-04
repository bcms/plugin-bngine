import { useStore } from '../store';
import { createJobHandler, JobHandler } from './job';
import { createProjectHandler, ProjectHandler } from './project';
export interface Api {
  project: ProjectHandler;
  job: JobHandler;
}

let api: Api;

export function useApi(): Api {
  if (!api) {
    const store = useStore();

    const projectHandler = createProjectHandler({ store });
    const jobHandler = createJobHandler({ store });

    api = {
      project: projectHandler,
      job: jobHandler,
    };
  }
  return api;
}
