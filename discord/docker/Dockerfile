FROM node:latest
RUN mkdir -p /var/www/html
RUN yarn global add ffmpeg-binaries
WORKDIR /var/www/html
COPY ./ /var/www/html
CMD node app.js