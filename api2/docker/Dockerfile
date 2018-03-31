FROM node:latest
RUN yarn global add ffmpeg-binaries
RUN npm install -g nodemon typescript
RUN npm install
RUN tsc --watch --noImplicitThis false

RUN mkdir -p /var/www/html
WORKDIR /var/www/html
COPY ./dist /var/www/html

CMD nodemon -L /var/www/html/dist/server.js
