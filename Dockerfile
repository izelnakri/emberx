FROM node:16.1.0

RUN apt-get update && \
  apt-get install -y vim chromium

WORKDIR /code/

ADD tsconfig.json package.json package.json webpack.config.js /code/

RUN npm install

ADD packages /code/packages

RUN npm install && npm run build

ADD tests /code/tests

ENTRYPOINT "/bin/sh"
