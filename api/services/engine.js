
var q = require('q');
var colors = require('colors');

// Database shit
const Fragment = require('../models/fragment');
const Word = require('../models/word');
const Source = require('../models/source');

// File stuff
const ffmpeg = require('fluent-ffmpeg');
const audioconcat = require('audioconcat');
const guid = require('guid');

var Engine = function () {
	this.blackmagic('please let this work');
	//this.blackmagic('gas gas gas');
};

Engine.prototype.blackmagic = function (input, res) {

	var me = this;
	var deferred = q.defer();
	var input = input.toLowerCase().split(' ');

	console.log('starting new blackmagic for:'.green, input.toString().yellow);

	//var combinations = new Array();
	// for(var i = 0; i < input.length; i++) {
	// 	for(var j = i + 1; j <= input.length; j++) {
	// 		combinations.push(input.slice(i, j));
	// 	}	
	// }

	let combinations = new Array();

	for (var start = 0; start < input.length; start++) {
		var phrase = "";
		for (var i = start; i < input.length; i++) {
			phrase = phrase + input[i] + " ";
			combinations.push(phrase.substring(0, phrase.length - 1));
		}
	}

	console.log("Combinations");
	console.log(combinations);

	// Find the words in the database
	Word.find({ text: combinations }).populate({ path: 'fragments', model: 'Fragment', populate: { path: 'word', model: 'Word' } }).then(function (words) {

		if (words.length == 0) {
			deferred.reject({ status: 422, message: 'Could not find any matching words in the database' });
		}

		// Database results are not ordered, let's order them
		var orderedWords = new Array();
		for (var word of combinations) {
			var w = words.find(function (w) { return word == w.text; });
			if (w) { orderedWords.push(w); }
		}

		//console.log('ordered words:', orderedWords);

		var traces = me.trace(orderedWords);
		//console.log('traces:'.yellow, traces);

		// FYI: Traces are fragments
		// pick random, let's say we have 5 traces with the same length, pick one per length. if that makes sense.

		// Group by length, then pick random?
		var groupBy = function (xs, key) {
			return xs.reduce(function (rv, x) {
				(rv[x[key]] = rv[x[key]] || []).push(x);
				return rv;
			}, {});
		};

		var grouped = groupBy(traces, 'length');
		//console.log('grouped:', grouped);

		var randomTraces = new Array();
		// Pick random trace from the grouped fragments
		for (var key in grouped) {
			var group = grouped[key];

			var random = Math.floor((Math.random() * group.length));
			var randomTrace = group[random];
			randomTraces.push(randomTrace);
			//console.log(randomTrace);
		}

		randomTraces.sort(function (a, b) {
			return b.length - a.length;
		});

		//console.log('random traces (per length):'.green, randomTraces);

		// Now try to match these random traces ontop of the given input to get the results
		console.log('trying to match (random) traces...'.green);
		
		var inputToProcess = input;

		console.log("===== Random Traces ======");
		console.log(randomTraces);

		console.log("===== Input ======");
		console.log(inputToProcess);

		for (var traces of randomTraces) {

			if (inputToProcess.length == 0) { break; }

			// Build array of words from this specific trace so we can match it with the input
			var words = new Array();
			for (var trace of traces) {
				words.push(trace.word.text);
			}

			console.log("==== Words for trace =====");
			console.log(words)

			console.log('trying to remove:'.green, words, 'from'.green, inputToProcess);

			let tmp = [];

			if(words.length > 0){
				// Find the first word
				let start = 0;
				let index = -1;
				while(inputToProcess.indexOf(words[0],start) >= 0){
					let ind = inputToProcess.indexOf(words[0],start);
					// Sanity check
					if(inputToProcess.length >= (ind + words.length)){
						let br = false;
						let indx = ind;
						for(var word of words){
							if(inputToProcess[indx] == word){
								indx = indx + 1;
							}else{
								br = true;
								break;
							}
						}
						if(!br){
							start = ind + 1;
							index = ind;
						}
						start = ind + 1;
					}else{
						// Break the while loop
						start = ind + 1;
					}
				}

				if(index >= 0){
					// Replace words with fragments from inputToProcess
					inputToProcess.splice(index, words.length);
					let rTraces = traces.reverse();
					for (var trace of rTraces) {
						inputToProcess.splice(index,0, trace);
					}
				}

			}

			// for(var word of words) {
			// 	// TODO: find index and trace traces in that array so we know start and end index, then make those null?
			// 	let start = 0;
			// 	// Replace matchedTraces with the current words found
			// 	while( inputToProcess.indexOf(word, start) > 0 ){

			// 	}
			// }
			
		}

		deferred.resolve({ status: 200 , fragments : inputToProcess.filter( val => { return !(typeof(val) == "string") }) });

	}).catch(error => {
		console.error(error);
		deferred.reject({ status: 500, message: error });
	});

	return deferred.promise;
}

Engine.prototype.trace = function (words) {

	var traces = new Array();

	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		var nextWord = words[i + 1];
		console.log('starting new trace for word'.green, word.text);

		for (var fragment of word.fragments) {
			var fragmentTraces = this.traceFragments(i, words, fragment);
			//console.log('fragmentTraces:', fragmentTraces);
			traces.push(fragmentTraces);
		}
	}

	// We want the ones with the most entries at the top of the array, so let's sort on length.
	traces.sort(function (a, b) {
		return b.length - a.length;
	});

	return traces;
}

Engine.prototype.traceFragments = function (index, words, fragment, traces) {
	// index = current word index
	// words = the word array
	// fragment = the current fragment we need to start a trace for
	// traces = array containing all the fragments we've traced

	var word = words[index];
	var nextWord = words[index + 1];
	if (!traces) {
		traces = new Array();
		traces.push(fragment);
	}

	console.log('tracing fragment'.yellow, fragment.id);

	if (nextWord) {
		for (var nextFragment of nextWord.fragments) {
			if (nextFragment.source.equals(fragment.source) && Number(nextFragment.start) > Number(fragment.start) && traces.filter(trace => (trace.id == nextFragment.id)).length == 0) {
				console.log(fragment.id, '(' + fragment.word.text + " " + fragment.start + ')', 'source is same as'.green, nextFragment.source, '(' + nextFragment.word.text + " " + nextFragment.start + ')', '('.yellow + fragment.source.toString().yellow + ')'.yellow);
				traces.push(nextFragment);
				this.traceFragments(index + 1, words, nextFragment, traces);
			}
		}
	}

	return traces;
}

module.exports = new Engine();