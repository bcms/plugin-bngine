const { BCMSConfigBuilder } = require('@becomes/cms-bundler');

module.exports = BCMSConfigBuilder({
  backend: {
    port: 1282,
    security: {
      jwt: {
        issuer: 'localhost',
        secret: 'secret',
      },
    },
    database: {
      // fs: 'bcms',
      mongodb: {
        selfHosted: {
          host: '192.168.1.10',
          port: 27017,
          name: 'pinkerton_v2',
          user: 'test',
          password: 'test1234',
          prefix: 'pinkerton',
        },
      },
    },
  },
  plugins: [
    {
      name: 'bngine',
      frontend: {
        displayName: 'Build Engine',
      },
    },
  ],
});
