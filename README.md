# BCMS - Plugin Starter

This project will help you to develop a BCMS plugin. Plugin, in context of the BCMS, is a software bundle which is packed in a specific way and has direct access to internal API of the BCMS backend and the UI.

## Getting started

- You will need to have Node, NPM, Docker and Docker Compose installed on your system,
- Setup project by running: `npm run setup`,
- To start a development server run: `docker-compose up`, depending on how Docker Compose was installed, you might need to run `docker compose up`,
- **IMPORTANT:** application will be available on port **8080**, ports which are printed in the console are for internal us. We are working on making this more clear and abstracting internal ports. 

## Bundling plugin

When you are done with development and you are ready to use the plugin in the production, run `npm run bundle`. This will create package of your plugin which you can copy to the BCMS project or upload it to the instance using BCMS Cloud Dashboard.
