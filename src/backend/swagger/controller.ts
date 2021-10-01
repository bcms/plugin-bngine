import {
  createController,
  createControllerMethod,
  useFS,
} from '@becomes/purple-cheetah';
import * as path from 'path';
import { setup } from 'swagger-ui-express';
import * as YAML from 'yamljs';
import type { Request, Response } from 'express';
import type { FS } from '@becomes/purple-cheetah/types';
import { BCMSConfig } from '@becomes/cms-backend/config';

interface Setup {
  fs: FS;
}

let swaggerHandler: (
  request: Request,
  response: Response,
  callback: () => void
) => void;

export const SwaggerController = createController<Setup>({
  name: 'Swagger Controller',
  path: '/doc',
  async setup() {
    return {
      fs: useFS(),
    };
  },
  methods({ fs }) {
    return {
      get: createControllerMethod({
        path: '',
        type: 'get',
        async handler({ request, response }) {
          if (!swaggerHandler) {
            const file = (
              await fs.read(path.join(process.cwd(), 'bngine-api.spec.yml'))
            )
              .toString()
              .replace('@PORT', '' + BCMSConfig.port)
              .replace('@PLUGIN_NAME', 'bcms-plugin---name');
            swaggerHandler = setup(YAML.parse(file), {
              customCss: '.swagger-ui .topbar { display: none }',
            });
          }
          swaggerHandler(request, response, () => {
            return;
          });
        },
      }),
    };
  },
});
