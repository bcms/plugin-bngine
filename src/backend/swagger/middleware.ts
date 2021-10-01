import { createMiddleware } from '@becomes/purple-cheetah';
import { serve } from 'swagger-ui-express';

export const SwaggerMiddleware = createMiddleware({
  name: 'Swagger Middleware',
  path: '/doc',
  after: false,
  handler() {
    return serve;
  },
});
