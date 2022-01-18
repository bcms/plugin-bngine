import { JobPipe } from 'src/backend/types';
import { useStore } from '../store';
import { StoreMutationTypes } from '../types';
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

  if (window.bcms.sdk.socket.self) {
    window.bcms.sdk.socket.self.on('JOB', async (data) => {
      console.log('NEW JOB', data);
      // await window.bcms.util.throwable(async () => {
      //   await jobHandler.get({
      //     id: data.j,
      //     skipCache: true,
      //   });
      // });
    });
    window.bcms.sdk.socket.self.on(
      'JOB_PIPE_CREATE',
      async (data: { j: string; p: JobPipe }) => {
        console.log('CREATE PIPE', data);
        // await window.bcms.util.throwable(
        //   async () => {
        //     return await jobHandler.get({
        //       id: data.j,
        //     });
        //   },
        //   async (result) => {
        //     result.pipe.push(data.p);
        //     store.commit(StoreMutationTypes.job_set, result);
        //   }
        // );
      }
    );
  }

  return {
    project: projectHandler,
    job: jobHandler,
  };
}
