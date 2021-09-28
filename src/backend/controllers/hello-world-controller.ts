import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';

export const HelloWorldController = createController({
  path: '/',
  name: 'Hello world controller',
  methods() {
    return {
      sayHi: createControllerMethod<unknown, { message: string }>({
        path: '/hi',
        type: 'get',
        async handler() {
          return {
            message: 'Hi!',
          };
        },
      }),
      greet: createControllerMethod<{ name: string }, { message: string }>({
        path: '/:name',
        type: 'get',
        async preRequestHandler({ request }) {
          return {
            name:
              request.params.name.substring(0, 1).toUpperCase() +
              request.params.name.substring(1).toLowerCase(),
          };
        },
        async handler({ name }) {
          return {
            message: `Hello ${name}!`,
          };
        },
      }),
    };
  },
});
