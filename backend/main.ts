import { createBcmsPlugin } from '@becomes/cms-backend/plugin';
import { JobController } from './job';
import { ProjectController } from './project';

export default createBcmsPlugin({
  name: 'bcms-plugin---name',
  controllers: [JobController, ProjectController],
});
