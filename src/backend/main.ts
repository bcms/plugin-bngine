import { createBcmsPlugin } from '@becomes/cms-backend/plugin';
import { HelloWorldController } from './controllers';

export default createBcmsPlugin({
  name: 'bcms-plugin---name',
  controllers: [HelloWorldController],
});
