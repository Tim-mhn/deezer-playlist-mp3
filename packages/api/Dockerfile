FROM node:20.17.0-alpine

WORKDIR /app


COPY src src
COPY package.json package.json 
COPY tsconfig.json tsconfig.json

RUN corepack enable

RUN yarn set version 4.4.0

RUN yarn install

RUN yarn build

CMD ["node", "dist/server.js"]
