FROM node:latest
RUN yarn global add ffmpeg-binaries
RUN mkdir -p /var/www/html
RUN npm install -g nodemon typescript


COPY ./package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /var/www/html && cp -a /tmp/node_modules /var/www/html

WORKDIR /var/www/html
COPY ./ /var/www/html
RUN npm install

RUN tsc

COPY "docker/start.sh" /var/www/start.sh
RUN chmod +x /var/www/start.sh
CMD bash /var/www/start.sh 


# FROM node:8-slim

# WORKDIR /app
# COPY . /app
# RUN npm install

# EXPOSE 3000
# CMD [ "npm", "start" ]