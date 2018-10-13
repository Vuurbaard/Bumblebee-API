# API Usage flow

## Usage by some kind of app
`Unkown external user is i.e. a user from Discord that has not been created in any way in the Bumblebee API yet.`


Unknown external user wants to invoke text to speech endpoint.

Discord app sends `POST` request to api.bumblebee.fm/v1/externaluser to create or update the externaluser and the api returns `externaluser` object.

Discord app sends `POST` request to api.bumblebee.fm/v1/tts with the `externaluser` object in the body.

The API then changes usage limit for that `externaluser`. If still positive than do normal text to speech functionality.

If usage limit has been reached and the `externaluser` has no `user` linked still than prompt the Discord app to let the user create an account on bumblebee.fm with the externalid attached so it can link the two together.

If usage limit has been reached and the `externaluser` has a `user` linked then prompt the Discord app to let the user pay for more.


## Problem with bumblebee.fm
We want people to freely use the api (for a limited amount of time) by some kind of token. However, we need to generate some kind of access token but it needs to be hardcoded into javascript files or something. I don't know... :(