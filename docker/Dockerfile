FROM node:14-alpine
ARG NPM_GLOBAL_PACKAGES=typescript
ARG BUILD_PROD=false
WORKDIR /var/www/html

# Install FFMPEG
RUN apk add ffmpeg
COPY ./ /var/www/html
RUN if [ ! -z "$NPM_GLOBAL_PACKAGES" ] ; then npm install -g $NPM_GLOBAL_PACKAGES ; fi
RUN if [ "$BUILD_PROD" = "true" ] ; then npm ci && tsc && npm ci --production ; fi 
CMD npm run start-smart
