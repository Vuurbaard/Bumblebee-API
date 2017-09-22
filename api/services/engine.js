var q = require('q');
var Fragment = require('../models/fragment');
var Fragments = require('./fragments');

var Engine = function () {};

Engine.prototype.tts = function (text) {
	console.log('tts:', text);
	var combinations = this.makeWordCombinations(text);

	Fragments.search(text).then(result => {
		console.log('search result:', result);
	});
};

Engine.prototype.makeWordCombinations = function(text) {
	
	text = text.toLowerCase().split(' ');
	let combinations =  new Array();
	
	for (var start = 0; start < text.length; start++) {
		var phrase = "";
		for (var i = start; i < text.length; i++) {
			phrase = phrase + text[i] + " ";
			combinations.push(phrase.substring(0, phrase.length - 1));
		}
	}

	return combinations;
}


module.exports = new Engine();