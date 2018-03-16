FROM node:latest
RUN mkdir -p /var/www/html
RUN yarn global add ffmpeg-binaries
RUN npm install -g nodemon

COPY ./package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /var/www/html && cp -a /tmp/node_modules /var/www/html

WORKDIR /var/www/html
COPY ./ /var/www/html
COPY "docker/start.sh" /var/www/start.sh
RUN chmod +x /var/www/start.sh
CMD bash /var/www/start.sh 