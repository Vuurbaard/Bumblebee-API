//import { setTimeout } from 'timers';

// Read ENV file
require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const fs = require('fs');
const Queuer = require('./queuer');
const config = require('./config');

let authToken = "";
let queues = [];

client.on('ready', () => {

	// Try to login
	login();

});

client.on('message', message => {

	console.log("Discord message:", message.content);

	if (message.channel.name != "bumblebee") { return; }
	if (!message.member) { return; }
	if (!message.member.voiceChannel) { return; }
	if (message.member.user.bot) { return; }

	// Generate unique name for the queue we are going to use
	// Readable + unique
	var queueName = message.member.guild.name + message.member.guild.id;

	if (!queues[queueName]) {
		queues[queueName] = new Queuer();
	}

	// Current queue for guild (aka server)
	var queue = queues[queueName];

	queue.push(function (queuer) {
		message.member.voiceChannel.join().then(connection => {
			var options = {
				url: 'http://' + api() + '/audio/tts',
				body: { "text": message.content },
				json: true,
				headers: { 'Authorization': this.authToken }
			};

			request.post(options, function (error, response, body) {
				if (body && body.file) {
					let filepath = __dirname + '/../api' + body.file;

					console.log('Playing file:', filepath);					

					
					const dispatcher = connection.playFile(filepath, function (err, intent) {
						console.log('err:', err);
						console.log('intent:', intent);
					});

					dispatcher.on('start', function () {
						connection.player.streamingData.pausedTime = 0; // Fixes delays after starting different streams
					});

					dispatcher.on('end', function () {
						queuer.finish();
					});

					dispatcher.on('error', function (reason) {
						console.log('Dispatcher error ', reason)
						queuer.finish();
					});

					dispatcher.on('debug', function (info) {
						console.log(info)
					});

					if(body.wordsNotFound && body.wordsNotFound.length > 0) {
						message.reply('Missing words: ' + body.wordsNotFound);
					}

				}
				else if(body.wordsNotFound && body.wordsNotFound.length > 0) {
					message.reply('Missing words: ' + body.wordsNotFound);
					queuer.finish();
				}
				else {
					console.error("Something went wrong doing the API request", error, body);
					queuer.finish();
				}
			});

		}).catch(function (err) {
			console.log(err);
			queuer.finish()
		});
	});

	queue.run();

});

client.on('debug', info => {
	console.log(info);
});

client.login(config.clientToken);

function api() {
	return process.env.API_HOST + ':' + process.env.API_PORT;
}

function login() {
	console.log('Ready!');

	var options = {
		url: 'http://' + api() + '/users/authenticate',
		body: { "username": "Zunz", "password": "123" },
		json: true
	};

	console.log('Trying to authenticate with Bumblebee API...');
	request.post(options, function (error, response, body) {
		if (body) {
			if (body.success) {
				console.log('Authenticated!');
				this.authToken = body.token;
			}
			else {
				console.log(body);
				console.log(body.error);
			}
		}
		else {
			// Seems like the API is down?
			console.error("Cannot connect to the API", options);
			setTimeout(() => {
				console.log("Retrying...");
				login();
			}, 5000)
		}
	});
}