const q = require('q');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');


var Audio = function () {
	this.extension = ".mp3";
};

Audio.prototype.download = function(url) {
	var deferred = q.defer();

	if(url.indexOf('youtube.com') != -1) {
		this.downloadFromYouTube(url).then(file => {
			deferred.resolve(file);
		}).catch(deferred.reject);
	}

	return deferred.promise;
}

Audio.prototype.downloadFromYouTube = function(url) {

	let youtubeID = url.replace('https://www.youtube.com/watch?v=', '');
	let id = "YT" + youtubeID;
    let filename = id + this.extension;
    let filepath = path.resolve(__dirname, '../audio/youtube/' + filename);
	let publicfilepath = '/youtube/' + filename;
	
	var file = {
		name: id,
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
			console.log("Done downloading", id, "from YouTube");
			deferred.resolve(file);
		});
	}
	else {
		deferred.resolve(file);
	}

	return deferred.promise;
}

module.exports = new Audio();