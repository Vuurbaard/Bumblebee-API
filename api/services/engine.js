var q = require('q');
var Fragment = require('../models/fragment');
var Fragments = require('./fragments');

var Engine = function () {};

Engine.prototype.tts = function (text) {
	console.log('tts:', text);
	
	Fragments.search(text).then(result => {
		console.log('search result:', result);
	});
};


module.exports = new Engine();