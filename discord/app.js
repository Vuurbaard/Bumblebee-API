const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const fs = require('fs');

let authToken = "";

client.on('ready', () => {
  console.log('Ready!');

  var options = {
    url: 'http://127.0.0.1:3000/users/authenticate',
    body: {"username": "Zunz", "password": "123"},
    json: true
  };

  console.log('Trying to authenticate with Bumblebee API...');
  request.post(options, function (error, response, body) {
    if(body){
      if(body.success) {
        console.log('Authenticated!');
        this.authToken = body.token;
      }
      else {
        console.log(body.error);
      }
    }else{
      // Seems like the API is down?
      console.error("Cannot connect to the API", options);
    }

  });

});
 
client.on('message', message => {
 
  console.log("Discord message:", message.content);

  if(message.channel.name != "bot") { return; }
  if(!message.member) { return; }
  if(!message.member.voiceChannel) { return; }

  message.member.voiceChannel.join().then(connection =>{

    var options = {
      url: 'http://127.0.0.1:3000/audio/tts',
      body: {"text": message.content},
      json: true,
      headers: {'Authorization': this.authToken}
    };

    request.post(options, function (error, response, body) {

      console.log(error);
      console.log(body);

      if(body){
        let filepath = __dirname + '/../api' + body.file;

        // Check if the file exists

          console.log('Playing file:', filepath);
          
          const dispatcher = connection.playFile(filepath, function(err, intent) {
            console.log('err:', err);
            console.log('intent:', intent);
          });
          // Fixes delays after starting different streams
          dispatcher.on('start', function() {
            connection.player.streamingData.pausedTime = 0;
          });
          dispatcher.on('error',function(reason){
            console.log('Dispatcher error ', reason)
          });  
          dispatcher.on('debug',function(info){
            console.log(info)
          });
      }else{
        console.error("Something went wrong doing the API request");
      }
    });
      
  }).catch(err => console.log(err));
});

client.on('debug', info => {
    console.log(info);
});

client.login('MzEyNjU5NjYxNzc2MDkzMTg1.DFs3hA.WG_qmBq9RkZ4SM4sqo_LLA4BR0k');

//client.login('MzQwNjE3NzIwNjk1NjE5NTg1.DF1I2w.hD6Yb04HsGSdYxmc_AONFAwDvLM');

