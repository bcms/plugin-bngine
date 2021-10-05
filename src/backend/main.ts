import { createBcmsPlugin } from '@becomes/cms-backend/plugin';
import { BCMSConfig } from '@becomes/cms-backend/config';
import { ProjectController } from './project';
import { SwaggerController, SwaggerMiddleware } from './swagger';
import type { Controller, Middleware } from '@becomes/purple-cheetah/types';
import { JobController } from './job/controller';

const controllers: Controller[] = [ProjectController, JobController];
const middleware: Middleware[] = [];

if (BCMSConfig.local) {
  controllers.push(SwaggerController);
  middleware.push(SwaggerMiddleware);
}

export default createBcmsPlugin({
  name: 'bcms-plugin---name',
  controllers,
  middleware,
});
