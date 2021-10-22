import { createBcmsPlugin } from '@becomes/cms-backend/plugin';
import type { Controller, Middleware } from '@becomes/purple-cheetah/types';
import { ProjectController } from './project';
import { JobController } from './job';

const controllers: Controller[] = [ProjectController, JobController];
const middleware: Middleware[] = [];

export default createBcmsPlugin({
  name: 'bcms-plugin---name',
  controllers,
  middleware,
});
