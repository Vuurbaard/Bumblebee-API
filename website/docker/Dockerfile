FROM node:latest

RUN ls /usr/local/lib/node_modules/
RUN yarn global add @angular/cli

RUN mkdir -p /var/www/html

WORKDIR /var/www/html

COPY ./ /var/www/html
CMD ng serve --host --base-href /
