FROM node:latest
ARG NPM_INSTALL_BEFORE=true
RUN yarn global add ffmpeg-binaries@3.2.2-3
RUN mkdir -p /var/www/html
RUN npm install -g nodemon typescript
RUN npm install -g ffmpeg-binaries@3.2.2-3 nodemon typescript



COPY ./package.json /tmp/package.json

WORKDIR /var/www/html
COPY ./ /var/www/html
RUN if [ $NPM_INSTALL_BEFORE = "true" ]; then \
    ls /tmp && \
    cd /tmp && \
    npm install && \
    mkdir -p /var/www/html && cp -a /tmp/node_modules /var/www/html ; \
    fi

COPY "docker/start.sh" /var/www/start.sh
RUN chmod +x /var/www/start.sh
CMD bash /var/www/start.sh 
