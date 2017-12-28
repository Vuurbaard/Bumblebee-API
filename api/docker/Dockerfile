FROM node:latest
RUN yarn global add ffmpeg-binaries
RUN mkdir -p /var/www/html
WORKDIR /var/www/html
COPY ./ /var/www/html
CMD node app.js