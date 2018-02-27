const q = require('q');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
var Source = require('../models/source');
var os = require('os');

var Audio = function () {
	this.extension = ".mp3";

	this.downloadMissingYouTubeFiles();
};

Audio.prototype.download = function (url) {
	var deferred = q.defer();

	if (url.indexOf('youtube.com') != -1) {
		this.downloadFromYouTube(url).then(file => {
			deferred.resolve({ file: file, origin: "YouTube" });
		}).catch(deferred.reject);
	}

	return deferred.promise;
}

Audio.prototype.downloadFromYouTube = function (url) {

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

	if (!fs.existsSync(filepath)) {
		console.log('Download of youtube video', youtubeID, 'starting...');
		ffmpeg()
			.input(ytdl(url))
			.noVideo()
			.audioBitrate(256)
			.save(filepath)
			.on('error', err => {
				console.error(err);
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

Audio.prototype.saveSource = function (id, origin, userId) {
	var deferred = q.defer();

	Source.findOne({ 'id': id, 'origin': origin }, (err, source) => {
		if (err) { deferred.reject(err); }
		else if (source) { deferred.resolve(source); }
		else { // Insert

			console.log('Inserting new source', id, origin);
			let newSource = new Source({ id: id, origin: origin, createdBy: userId });
			newSource.save((err, source) => {
				if (err) { deferred.reject(err); }
				else if (source) { deferred.resolve(source); }
			});
		}
	});

	return deferred.promise;
}

Audio.prototype.downloadMissingYouTubeFiles = function () {
	if (os.hostname() != "DESKTOP-D1A4R6K") {
		Source.find({}, (err, sources) => {
			for (var source of sources) {
				if (source.origin == 'YouTube') {
					this.downloadFromYouTube('https://www.youtube.com/watch?v=' + source.id);
				}
			}
		});
	}
}

module.exports = new Audio();