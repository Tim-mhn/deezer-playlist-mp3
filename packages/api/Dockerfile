FROM ubuntu:18.04

SHELL ["/bin/bash", "-c"]

RUN apt-get update && \
      apt-get -y install sudo && \
      apt update

RUN apt-get install curl -y

# # Install Python 3.7 for youtube-dl-exec
# RUN apt install software-properties-common -y

# RUN add-apt-repository ppa:deadsnakes/ppa -y

# RUN apt install python3.7 -y



# Install Node 
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && export NVM_DIR="$HOME/.nvm" \
    && . $NVM_DIR/nvm.sh \
    && nvm install 20.11.1 \
    && nvm alias default 20.11.1 \
    && nvm use default \
    && node --version \
    && corepack enable \
    && corepack prepare yarn@4.4.0 --activate



WORKDIR /app


COPY src src
COPY package.json package.json 
COPY tsconfig.json tsconfig.json




RUN yarn set version 4.4.0

RUN yarn install

RUN yarn build

CMD ["node", "dist/server.js"]
