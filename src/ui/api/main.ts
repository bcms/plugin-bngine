import { useStore } from '../store';
import { createJobHandler, JobHandler } from './job';
import { createProjectHandler, ProjectHandler } from './project';

export interface Api {
  project: ProjectHandler;
  job: JobHandler;
}

export function useApi(): Api {
  const store = useStore();

  const projectHandler = createProjectHandler({ store });
  const jobHandler = createJobHandler({ store });

  return {
    project: projectHandler,
    job: jobHandler,
  };
}
