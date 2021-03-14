FROM node:15.11

RUN apt-get update && \
  apt-get install -y lsof vim libgtk-3-0 libatk1.0-0 libx11-xcb1 libnss3 libxss1 libasound2

WORKDIR /code/

ADD package-lock.json package.json /code/

RUN npm install

ADD src /code/src
ADD tests /code/tests
ADD . /code/

ENTRYPOINT "/bin/bash"
