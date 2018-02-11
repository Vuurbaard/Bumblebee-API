FROM node:latest
ARG DOCKER_SRC="./"

RUN apt-get update -qq && apt-get install apache2 -qq -y && rm -r /var/lib/apt/lists/*
RUN a2enmod rewrite

# Fix stupid angular CLI stuff
RUN yarn global add @angular/cli

# Back to normal

RUN mkdir -p /var/www/html

WORKDIR /var/www/html

COPY ./ /var/www/html
RUN ls
RUN cd /var/www/html
RUN npm i && ng build && cp .htaccess dist/
COPY ${DOCKER_SRC}apache2.conf /etc/apache2/apache2.conf
CMD apachectl -D FOREGROUND && tail -f /var/log/apache2/*.log