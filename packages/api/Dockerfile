FROM ubuntu:22.04

SHELL ["/bin/bash", "-c"]

RUN apt-get update && \
      apt-get -y install sudo && \
      apt update

RUN apt-get install curl -y

# # Install Python 3.7 for youtube-dl-exec
RUN apt install software-properties-common -y

RUN add-apt-repository ppa:deadsnakes/ppa -y

RUN apt install python3.7 -y



# Install Node 
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && export NVM_DIR="$HOME/.nvm" \
    && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
    && [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" \
    && nvm install 22.6.0 \
    && nvm alias default 22.6.0 \
    && nvm use default \
    && node --version 

# Set environment variables
ENV NVM_DIR=/root/.nvm
ENV NODE_VERSION=22.6.0
ENV NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH


RUN corepack enable && corepack prepare yarn@4.4.0 --activate

RUN node --version

WORKDIR /app


COPY src src
COPY package.json package.json 
COPY ../../yarn.lock yarn.lock
COPY tsconfig.json tsconfig.json
COPY .yarnrc.yml .yarnrc.yml

# Install dependencies and build
RUN . $NVM_DIR/nvm.sh && yarn set version 4.4.0 && yarn install && yarn run build:prod

RUN ls -al /app

CMD ["yarn", "start"]