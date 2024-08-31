FROM ubuntu:18.04

RUN apt-get update && \
      apt-get -y install sudo && \
      apt update

RUN apt-get install curl -y

# Install Python 3.7
RUN apt install software-properties-common -y



RUN add-apt-repository ppa:deadsnakes/ppa -y

RUN apt install python3.7 -y



# Install Node 
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

RUN nvm install 20.11.1

RUN corepack enable


WORKDIR /app


COPY src src
COPY package.json package.json 
COPY tsconfig.json tsconfig.json




RUN yarn set version 4.4.0

RUN yarn install

RUN yarn build

CMD ["node", "dist/server.js"]
