FROM node:12 as builder
WORKDIR /var/www/html
RUN mkdir -p /var/www/html
COPY ./ /var/www/html
RUN npm install -g typescript
ENV LC_ALL C.UTF-8
RUN npm install
RUN tsc


FROM node:12-alpine
WORKDIR /var/www/html
# Install FFMPEG
RUN apk add ffmpeg
RUN mkdir -p /var/www/html/tmp
COPY --from=builder /var/www/html /var/www/html
CMD node /var/www/html/dist/server.js

# RUN npm install -g nodemon
# CMD nodemon /var/www/html/dist/server.js
