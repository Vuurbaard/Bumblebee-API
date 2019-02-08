FROM node:10-alpine

ARG NPM_INSTALL_BEFORE=true

# Install FFMPEG
RUN apk add ffmpeg

ENV LC_ALL C.UTF-8

RUN mkdir -p /var/www/html
RUN npm install -g typescript

COPY ./package.json /tmp/package.json

WORKDIR /var/www/html
COPY ./ /var/www/html

RUN npm install
RUN tsc

CMD node /var/www/html/dist/server.js
