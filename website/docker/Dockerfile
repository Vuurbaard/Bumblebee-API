FROM node:latest
RUN apt-get update -qq && apt-get install apache2 -qq -y && rm -r /var/lib/apt/lists/*
# Enable rewrite module
RUN a2enmod rewrite

# Fix stupid angular CLI stuff
RUN yarn global add @angular/cli

# Default directory to work in
RUN mkdir -p /var/www/html
WORKDIR /var/www/html
COPY ./ /var/www/html
COPY ./apache2.conf /etc/apache2/apache2.conf
COPY ./start.sh /var/www/start.sh
RUN chmod +x /var/www/start.sh
CMD bash /var/www/start.sh 