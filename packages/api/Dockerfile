FROM node:20.17.0-alpine

WORKDIR /app


COPY src src
COPY package.json package.json 
COPY tsconfig.json tsconfig.json

# Install Python 3.7
RUN apt install software-properties-common

RUN add-apt-repository ppa:deadsnakes/ppa -y

RUN apt install python3.7 

RUN corepack enable

RUN yarn set version 4.4.0

RUN yarn install

RUN yarn build

CMD ["node", "dist/server.js"]
