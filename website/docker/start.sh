#!/bin/bash
FOO=${ANGULAR_ENV:=dev}
echo "Running NPM install..." 
npm install
echo "Starting build" 
mkdir /var/log/ng/ && touch /var/log/ng/build.log
mkdir /var/www/html/dist/
echo "Website is building.... please wait" > /var/www/html/index.html
nohup ng build --environment=${ANGULAR_ENV} --watch >> /var/log/ng/build.log &
echo "Starting Apache2"
nohup apachectl -D FOREGROUND & tail -f /var/log/apache2/*.log /var/log/ng/build.log