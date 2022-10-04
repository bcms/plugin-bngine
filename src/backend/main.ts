import { createBcmsPlugin } from '@becomes/cms-backend/plugin';
import type { Controller, Middleware } from '@becomes/purple-cheetah/types';
import { ProjectController } from './project';
import { JobController } from './job';
import { Repo } from './repo';
import type { BCMSPluginPolicy } from '@becomes/cms-backend/types';

const controllers: Controller[] = [ProjectController, JobController];
const middleware: Middleware[] = [];

export default createBcmsPlugin({
  name: 'bcms-plugin---name',
  controllers,
  middleware,
  async policy() {
    const projects = Repo.project ? await Repo.project.findAll() : [];
    return [
      ...projects.map((project) => { 
        const policy: BCMSPluginPolicy = {
          name: `Run project ${project.name}`,
          type: 'checkbox',
          default: [''],
          options: ['true', ''],
        };
        return policy;
      }),
    ];
  },
});
