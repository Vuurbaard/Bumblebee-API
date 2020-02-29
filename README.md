# Bumblebee API

## Development

Run `npm run tsc` for the typescript compiler to watch for file changes.
Run `nodemon dist/server.js` for nodemon to (re)start the API on file changes.



## Dump database (using docker)


`docker run --rm -v $(pwd)/backup:/backup mongo bash -c 'mongodump --out /backup --host ip:27017'`

`docker run --rm -v $(pwd)/backup:/backup mongo bash -c 'mongorestore /backup --host ip:27017'`


## Windows dump database using docker


`docker run --rm -v ${PWD}/backup:/backup mongo bash -c 'mongodump --out /backup --host ip:27017'`

`docker run --rm -v ${PWD}/backup:/backup mongo bash -c 'mongorestore /backup --host ip:27017'`


## Restore to docker-compose


`docker run --rm -v $(pwd)/backup:/backup mongo bash -c 'mongorestore /backup --host ip:27017'`
`docker run --rm -v ${PWD}/backup:/backup mongo bash -c 'mongorestore /backup --host ip:27017'`