import { createBcmsPlugin } from '@becomes/cms-backend/plugin';
import { ProjectController } from './project';

export default createBcmsPlugin({
  name: 'bcms-plugin---name',
  controllers: [ProjectController],
});
