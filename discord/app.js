const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');

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
    if(body.success) {
      console.log('Authenticated!');
      this.authToken = body.token;
    }
    else {
      console.log(body.error);
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

      let filepath = __dirname + '/../api' + body.file;

      console.log('Playing file:', filepath);
      
      connection.playStream(filepath, function(err, intent) {
        console.log('err:', err);
        console.log('intent:', intent);
      });
    });
      
  }).catch(err => console.log(err));

});

client.on('debug', info => {
    console.log(info);
});

client.login('MzEyNjU5NjYxNzc2MDkzMTg1.DFs3hA.WG_qmBq9RkZ4SM4sqo_LLA4BR0k');