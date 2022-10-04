# BCMS - Plugin Starter

This project will help you to develop a BCMS plugin. Plugin, in context of the BCMS, is a software which is packed in a specific way and has direct access to internal API of the BCMS backend and the UI.

## Getting started

- You will need to have Node, NPM, Docker and Docker Compose installed on your system,
- Create empty directories `db` and `uploads` in the root of the project (this directories will be used by the backend), 
- To start a development server run: `docker-compose up`
- **IMPORTANT:** application will be available on port **8080**, ports which are printed in the console are for internal us. We are working on making this more clear and abstracting internal ports. 
- Have in mind that if you change anything outside of the `src` directory, you will need to run `docker-compose build`

## Bundling plugin

When you are done with development and you are ready to use the plugin in the production, run `npm run bundle`. This will create package of your plugin which you can copy to the BCMS project or upload it to the instance using BCMS Cloud Dashboard.
