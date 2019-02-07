#!/bin/sh
npm install

USE_NODEMON=${USE_NODEMON:=true}

if [ $USE_NODEMON = "true" ]; then \
echo "Running via Nodemon";
tsc -w &
nodemon -L /var/www/html/dist/server.js
else
echo "Running via Node";
tsc
node /var/www/html/dist/server.js
fi
