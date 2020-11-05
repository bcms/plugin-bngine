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
          host: process.env.DB_HOST,
          name: process.env.DB_NAME,
          password: process.env.DB_PASS,
          port: parseInt(process.env.DB_PORT, 10),
          prefix: process.env.DB_PRFX,
          user: process.env.DB_USER,
        },
        // atlas: {
        //   name: process.env.DB_NAME,
        //   user: process.env.DB_USER,
        //   password: process.env.DB_PASS,
        //   prefix: 'pinkerton',
        //   cluster: process.env.DB_CLUSTER,
        // },
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
