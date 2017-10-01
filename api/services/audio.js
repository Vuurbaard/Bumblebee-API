const q = require('q');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
var Source = require('../models/source');

var Audio = function () {
	this.extension = ".mp3";
};

Audio.prototype.download = function(url) {
	var deferred = q.defer();

	if(url.indexOf('youtube.com') != -1) {
		this.downloadFromYouTube(url).then(file => {
			deferred.resolve({file: file, origin: "YouTube" });
		}).catch(deferred.reject);
	}

	return deferred.promise;
}

Audio.prototype.downloadFromYouTube = function(url) {

	let youtubeID = url.replace('https://www.youtube.com/watch?v=', '');
    let filename = youtubeID + this.extension;
    let filepath = path.resolve(__dirname, '../audio/youtube/' + filename);
	let publicfilepath = '/youtube/' + filename;
	
	var file = {
		id: youtubeID,
		filename, filename,
		path: filepath,
		publicpath: publicfilepath
	}

	var deferred = q.defer();
	
	if(!fs.existsSync(filepath)) {
		console.log('Download starting...');
		ffmpeg()
		.input(ytdl(url))
		.noVideo()
		.audioBitrate(64)
		.save(filepath)
		.on('error', err => {
			// console.error(err);
			deferred.reject(err);
		})
		.on('end', function () {
			console.log("Done downloading", youtubeID, "from YouTube");
			deferred.resolve(file);
		});
	}
	else {
		deferred.resolve(file);
	}

	return deferred.promise;
}

Audio.prototype.saveSource = function(id, origin) {
	var deferred = q.defer();

	var query = { 'id': id, 'origin': origin},
	update = {},
	options = { upsert: true, new: true, setDefaultsOnInsert: true };

	console.log('Saving or updating source', query);

	Source.findOneAndUpdate(query, update, options, function (error, result) {
		if (error) {
			console.log(error);
			return;
		}

		deferred.resolve(result);
	});

	return deferred.promise;
}

module.exports = new Audio();