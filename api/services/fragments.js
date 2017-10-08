const q = require('q');
var Source = require('../models/source');
var Fragment = require('../models/fragment');
var Word = require('../models/word');

var Fragments = function () { };

Fragments.prototype.search = function (phrase) {

	var deferred = q.defer();

	this.findWords(phrase).then(this.findBestMatch.bind(this));

	return deferred.promise;
}

Fragments.prototype.findWords = function (phrase) {
	var deferred = q.defer();

	var words = phrase.split(' ');

	(function find(index, foundWords) {

		var word = words[index];

		Word.find({ text: word }).populate('links').populate('fragments').then(function (word) {
			//console.log('Found word', word[0]);
			foundWords.push(word[0]);

			if (index == words.length - 1) {
				deferred.resolve(foundWords);
			}
			else {
				find(++index, foundWords);
			}
		});
	})(0, new Array());

	return deferred.promise;
}

Fragments.prototype.findBestMatch = function (words) {
	// console.log('Gotta find best fragment matches for', words);
	// FYI: Words are already database records.
	var wordCombinations = new Array();

	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		var nextWord = words[i + 1];

		if (this.isWordLinked(word, nextWord)) {
			var combination = new Array();
			combination.push(word);
			//console.log('starting new trace...');

			// This word has a link to the next word, so we need to trace it to the deepest link level
			var traces = 1;
			while (this.isWordLinked(word, nextWord)) {
				//console.log('tracing', word.text, '->', nextWord.text);
				combination.push(nextWord);

				word = words[i + traces];
				nextWord = words[i + traces + 1];
				traces++;
			}
			wordCombinations.push(combination);
			//console.log(words[i].text, 'traces down to', combination);
			i += combination.length - 1;
		}
		else {
			wordCombinations.push([word]);
		}
	}

	console.log(wordCombinations); // i.e. [['please', 'let', 'this'], ['down']]

	var fragments = new Array();

	for (var combinations of wordCombinations) {
		if (combinations.length > 1) {
			// Shit there are more words linked together in this array
			// The fact that they are linked together already means these words share atleast one same fragment source
			for (var i = 0; i < combinations.length; i++) {
				var word = combinations[i];
				var nextWord = combinations[i + 1];

				var fragmentIntersectionsBySource = this.getFragmentIntersectionsBySource(word, nextWord);

				// SEND HELP

				// // if it has just A fragment source intersection we need to trace this fragment down till the last matched word
				// if (fragmentIntersectionsBySource.length == 1) {
				// 	result.push({ word: word.text, fragments: fragmentIntersectionsBySource });
				// }
				// else {
				// 	// We have got multiple fragments source intersections for this word so we need to trace all of them down till we find the best one
				// 	// TODO: SEND HELP
				// }
			}
		}
		else if (combinations.length == 1) {
			// Only got one word in the combination so let's pick a random fragment
			fragments.push(combinations[0].fragments[0]); // TODO: Randomize
		}
	}

	console.log('Done?');
}

Fragments.prototype.getFragmentIntersectionsBySource = function (a, b) {
	if (!a || !b) { return new Array(); }

	var result = a.fragments.filter(function (aFragment) {
		return b.fragments.some(function (bFragment) {
			return aFragment.source.equals(bFragment.source);
		});
	})

	return result;
}

Fragments.prototype.isWordLinked = function (a, b) {
	if (!a || !b) { return false; }

	for (var linkedWord of a.links) {
		if (linkedWord._id.equals(b._id)) { // (_id is not a string)
			return true;
		}
	}
	return false;
}

Fragments.prototype.isWordLinkedByFragmentSource = function (a, b) {
	if (!a || !b) { return false; }

	for (var wordAFragment of a.fragments) {
		for (var wordBFragment of b.fragments) {
			if (wordAFragment.source.equals(wordBFragment.source)) {
				return true;
			}
		}
	}
	return false;
}



Fragments.prototype.submit = function (sourceId, fragments) {

	var deferred = q.defer();
	var me = this;

	// Sort fragments on attribute 'start'
	fragments.sort(function (a, b) { return parseFloat(a.start) - parseFloat(b.start) });

	this.saveWords(fragments).then(function (savedWords) {

		me.saveFragments(sourceId, fragments, savedWords).then(function () {
			console.log('Done processing fragments... Phew...');
			deferred.resolve();
		});

	});

	return deferred.promise;
}

Fragments.prototype.saveFragments = function (sourceId, fragments, words) {
	// Save all fragments here
	var deferred = q.defer();

	Source.findById(sourceId).then(function (source) {
		console.log('Found source to use for fragments:', source);

		(function insertOne(index, savedFragments) {

			var fragment = fragments[index];
			var word = words[index];

			var query = { 'source': source, 'start': fragment.start, 'end': fragment.end, word: word },
				update = {},
				options = { upsert: true, new: true, setDefaultsOnInsert: true };

			Fragment.findOneAndUpdate(query, update, options, function (error, fragment) {
				if (error) {
					console.log(error);
					return;
				}

				console.log('Inserted or updated the fragment:', fragment);
				savedFragments.push(fragment);

				if (word.fragments.indexOf(fragment._id) == -1) {
					console.log('Linking word', word.text, 'to this fragment');
					word.fragments.push(fragment);
					word.save(function (err, result) {
						if (index == fragments.length - 1) {
							deferred.resolve(savedFragments);
						}
						else {
							insertOne(++index, savedFragments);
						}
					});
				}
				else {
					console.log('Word', word.text, 'is already linked to fragment', fragment);
					if (index == fragments.length - 1) {
						deferred.resolve(savedFragments);
					}
					else {
						insertOne(++index, savedFragments);
					}
				}


			});

		})(0, new Array());
	});

	return deferred.promise;
}

Fragments.prototype.saveWords = function (fragments) {
	var deferred = q.defer();
	var me = this;

	(function insertOne(index, savedWords) {

		var fragment = fragments[index];
		console.log('Saving word', fragment.word);

		var query = { 'text': fragment.word },
			update = {},
			options = { upsert: true, new: true, setDefaultsOnInsert: true };

		Word.findOneAndUpdate(query, update, options, function (error, result) {
			if (error) {
				console.log(error);
				return;
			}

			console.log('Inserted or updated the word:', result.text);
			savedWords.push(result);

			if (index == fragments.length - 1) {

				me.linkWords(savedWords).then(function () {
					deferred.resolve(savedWords);
				});
			}
			else {
				insertOne(++index, savedWords);
			}
		});
	})(0, new Array());

	return deferred.promise;
}

Fragments.prototype.linkWords = function (words) {
	var deferred = q.defer();

	(function link(index) {

		if (index == words.length) {
			deferred.resolve(words);
		}
		else {

			var word = words[index];
			//console.log('Linking', word.text, 'to previous word');
			var previousIndex = index - 1;
			var previousWord = words[previousIndex];

			if (previousWord) {

				if (previousWord.links.indexOf(word._id) == -1) {
					previousWord.links.push(word);

					previousWord.save(function (err) {
						if (err) { console.log(err); }
						console.log('linked', previousWord.text, 'to', word.text);
						link(++index);
					});
				}
				else {
					console.log(previousWord.text, 'is already linked to', word.text);
					link(++index);
				}

			}
			else {
				console.log('Did not find previous word to link, skipping this.');
				link(++index);
			}
		}
	})(1); // Start at index 1 because we don't need to link the first result to anything

	return deferred.promise;
}

Fragments.prototype.getFragmentsBySource = function (source) {
	var deferred = q.defer();

	Fragment.find({ 'source': source }).populate('word').then(function (fragments) {
		console.log('Found fragments by source', source, fragments);
		deferred.resolve(fragments);
	});

	return deferred.promise;
}

module.exports = new Fragments();