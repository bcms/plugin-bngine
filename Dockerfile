FROM node:16-slim

WORKDIR /app

COPY ./ui /app

RUN npm i

ENTRYPOINT [ "npm", "run", "dev" ]
