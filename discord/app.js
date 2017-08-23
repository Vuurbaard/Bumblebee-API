const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const fs = require('fs');
const Queuer = require('./queuer');

let authToken = "";
let queues = [];

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

  // Generate unique name for the queue we are going to use
  // Readable + unique
  var queueName = message.member.guild.name + message.member.guild.id;

  if(!queues[queueName]){
    queues[queueName] = new Queuer();
  }

  // Current queue for guild (aka server)
  var queue = queues[queueName];

  
  queue.push(function(queuer){
    message.member.voiceChannel.join().then(connection =>{
        var options = {
          url: 'http://127.0.0.1:3000/audio/tts',
          body: {"text": message.content},
          json: true,
          headers: {'Authorization': this.authToken}
        };
        console.log("!");
        request.post(options, function (error, response, body) {
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
              dispatcher.on('end',function(){
                queuer.finish();
              });
              dispatcher.on('error',function(reason){
                console.log('Dispatcher error ', reason)
                queuer.finish();
              });  
              dispatcher.on('debug',function(info){
                console.log(info)
              });
          }else{
            console.log("HELP US")
            console.error("Something went wrong doing the API request");
            queuer.finish();
          }
        });
          
      }).catch(function(err){ console.log(err); queuer.finish()});
  });
  queue.run();
  
});

client.on('debug', info => {
    console.log(info);
});

// Production
client.login('MzEyNjU5NjYxNzc2MDkzMTg1.DFs3hA.WG_qmBq9RkZ4SM4sqo_LLA4BR0k');

// Developer
//client.login('MzQwNjE3NzIwNjk1NjE5NTg1.DF1I2w.hD6Yb04HsGSdYxmc_AONFAwDvLM');

