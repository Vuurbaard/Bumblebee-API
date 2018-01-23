
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
	//this.blackmagic('please let this work');
	//this.blackmagic('gas gas gas');

	//try {
	//this.asyncmagic('please work');
	//}
	//catch (err) {
	//	console.log("Error:".red, err);
	//}

};

Engine.prototype.asyncmagic = async function (input) {

	var deferred = q.defer();

	var input = input.toLowerCase().split(' ');

	console.log('starting new asyncmagic for:'.green, input.toString().yellow);

	let combinations = new Array();

	for (var start = 0; start < input.length; start++) {
		var phrase = "";
		for (var i = start; i < input.length; i++) {
			phrase = phrase + input[i] + " ";
			combinations.push(phrase.substring(0, phrase.length - 1));
		}
	}

	console.log("combinations:".green, combinations.toString().yellow);

	let words = await Word.find({ text: combinations }).populate({ path: 'fragments', model: 'Fragment', populate: { path: 'word', model: 'Word' } }).populate({ path: 'fragments', model: 'Fragment', populate: { path: 'source', model: 'Source' } });

	if (words.length == 0) {
		// deferred.reject({ status: 422, message: 'Could not find any matching words in the database' });
		console.log('words not found:', combinations)
		deferred.resolve({ wordsNotFound: input });
		return deferred.promise;
	}

	// Database results are not ordered, let's order them
	var orderedWords = new Array();
	for (var word of combinations) {
		var w = words.find(function (w) { return word == w.text; });
		if (w) { orderedWords.push(w); }
	}

	// FYI: Traces are fragments
	var traces = await this.trace(orderedWords);
	console.log('traces:'.green);
	for (var trace of traces) {
		console.log(trace[0].word.text, '->'.green, trace[trace.length - 1].word.text);
	}

	// Shuffle the traces to gain some randomness
	this.shuffle(traces);

	// Sort them by length, highest length first
	traces.sort(function (a, b) {
		return b.length - a.length;
	});

	var randomTraces = traces;
	var inputToProcess = input;
	var fragments = new Array();

	for (var traces of randomTraces) {

		if (inputToProcess.length == 0) { break; }

		// Build array of words from this specific trace so we can match it with the input
		var wordsFromTrace = new Array();
		for (var trace of traces) {
			wordsFromTrace.push(trace.word.text);
		}

		console.log('trying to remove:'.green, wordsFromTrace, 'from'.green, inputToProcess);

		if (wordsFromTrace.length > 0) {
			// Find the first word
			let start = 0;
			let index = -1;
			while (inputToProcess.indexOf(wordsFromTrace[0], start) >= 0) {
				let ind = inputToProcess.indexOf(wordsFromTrace[0], start);
				// Sanity check
				if (inputToProcess.length >= (ind + wordsFromTrace.length)) {
					let br = false;
					let indx = ind;
					for (var word of wordsFromTrace) {
						if (inputToProcess[indx] == word) {
							indx = indx + 1;
						}
						else {
							br = true;
							break;
						}
					}
					if (!br) {
						start = ind + 1;
						index = ind;
					}
					start = ind + 1;
				}
				else {
					// Break the while loop
					start = ind + 1;
				}
			}

			if (index >= 0) {

				// Set end time of the first fragment to the end time of the last fragment in this trace
				// It is a bit cheaty, but it works.
				for (var i = 0; i < traces.length; i++) {
					var fragment = traces[i];

					console.log('traces:'.red, traces);

					if (!fragments[index]) {
						fragments[index] = {
							order: index,
							start: fragment.start,
							end: fragment.end,
							id: fragment.id,
							source: fragment.source,
							endFragment: fragment
						}
					}
					else {
						fragments[index].end = fragment.end;
						fragments[index].endFragment = fragment;
					}
				}

				// Replace words with fragments in inputToProcess
				inputToProcess.splice(index, wordsFromTrace.length);
				for (var trace of  traces.reverse()) {
					inputToProcess.splice(index, 0, trace);
				}

			}
		}
	}

	console.log('fragments:'.red, fragments)

	fragments = fragments.filter(val => { return !(typeof (val) == "string") });

	this.fileMagic(fragments).then((data) => {
		//console.log(data);
		data.wordsNotFound = inputToProcess.filter(val => { return (typeof (val) == "string") });
		deferred.resolve(data);
	});

	return deferred.promise;
}

Engine.prototype.trace = async function (words) {

	var traces = new Array();

	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		var nextWord = words[i + 1];
		console.log('starting new trace for word'.green, word.text);

		for (var fragment of word.fragments) {
			var fragmentTraces = await this.traceFragments(i, words, fragment);
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

Engine.prototype.traceFragments = async function (index, words, fragment, traces) {
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

				var fragmentsInBetween = await Fragment.count({
					start: { $gt: fragment.start, $lt: nextFragment.start },
					source: fragment.source
				});

				//console.log('fragmentsInBetween:'.red, fragmentsInBetween);

				if (fragmentsInBetween == 0) {
					console.log(fragment.id, '(' + fragment.word.text + " " + fragment.start + ')', 'source is same as'.green, nextFragment.id, '(' + nextFragment.word.text + " " + nextFragment.start + ')');
					traces.push(nextFragment);
					await this.traceFragments(index + 1, words, nextFragment, traces);
				}
			}
		}
	}

	return traces;
}

Engine.prototype.fileMagic = function (fragments) {

	// Generate temp files from fragments
	let tempFiles = new Array();
	let promises = new Array();

	for (var fragment of fragments) {

		(function (fragment) {
			var promise = new Promise(function (resolve, reject) {

				let filepath = __dirname + '/../audio/youtube/' + fragment.source.id.toString() + '.mp3';
				let outputpath = __dirname + '/../audio/fragments/' + fragment.id + '-' + fragment.endFragment.id +'.mp3';

				ffmpeg(filepath)
					.setStartTime(fragment.start)
					.setDuration(fragment.end - fragment.start)
					.output(outputpath)
					.on('end', function (err) {
						if (!err) {
							tempFiles.push({ order: fragment.order, file: fragment.id + '-' + fragment.endFragment.id + '.mp3' });
							resolve();
						}
					})
					.on('error', function (err) {
						console.log('ffmpeg error:', err);
						resolve();
					}).run();
			});
			promises.push(promise);
		})(fragment);
	}

	return Promise.all(promises).then(function () {

		function compare(a, b) {
			if (a.order < b.order)
				return -1;
			if (a.order > b.order)
				return 1;
			return 0;
		}
		tempFiles.sort(compare);

		// Audioconcat needs a non relative path. 
		let files = new Array();
		tempFiles.forEach(function (fragment) {
			files.push(__dirname + "/../audio/fragments/" + fragment.file);
		});

		// Concatenate the temp fragment files into one big one
		let outputfilename = guid.create() + '.mp3';

		return new Promise((resolve, reject) => {
			audioconcat(files)
				.concat(__dirname + "/../audio/temp/" + outputfilename)
				.on('start', function (command) {
					console.log('ffmpeg process started:', command)
				})
				.on('error', function (err, stdout, stderr) {
					console.error('Error:', err)
					console.error('ffmpeg stderr:', stderr)
					resolve({ error: 'FFMpeg failed to process file:' });
				})
				.on('end', function () {
					console.log('Audio created in:'.green, "/audio/temp/" + outputfilename);
					resolve({ file: "/audio/temp/" + outputfilename });
				})

		});
	});
}

Engine.prototype.shuffle = function (a) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
}

module.exports = new Engine();