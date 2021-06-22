FROM node:16.1.0

RUN apt-get update && \
  apt-get install -y vim chromium

WORKDIR /code/

ADD .babelrc tsconfig.json package.json package-lock.json webpack.config.js /code/

RUN npm install

ADD examples /code/examples
ADD scripts /code/scripts/
ADD packages /code/packages/
ADD test /code/test

RUN npm install && npm run build # registers workspaces

ENTRYPOINT "/bin/sh"
