const q = require('q');
var Source = require('../models/source');
var Fragment = require('../models/fragment');
var Word = require('../models/word');

var Fragments = function () { };

Fragments.prototype.search = function (phrase) {

	var deferred = q.defer();

	this.findWords(phrase).then(this.findBestMatch);

	return deferred.promise;
}

Fragments.prototype.findWords = function(phrase) {
	var deferred = q.defer();

	var words = phrase.split(' ');

	(function find(index, foundWords) {

		var word = words[index];

		Word.find({text: word}).populate('links').populate('fragments').then(function(word) {
			//console.log('Found word', word[0]);
			foundWords.push(word[0]);

			if(index == words.length - 1) {
				deferred.resolve(foundWords);
			}
			else {
				find(++index, foundWords);
			}
		});
	})(0, new Array());

	return deferred.promise;
}

Fragments.prototype.findBestMatch = function(words) {
	//console.log('Gotta find best fragment matches for', words);
	
	// FYI: Words are already database records.
	var word = words[0]; 
	var nextWord = words[1];

	if(nextWord) {
		console.log('Checking if', word.text, 'has a link to', nextWord.text + '...');

		var foundNextWord = false;
		for(var linkedWord of word.links) {
			if(linkedWord._id.equals(nextWord._id)) { // (_id is not a string)
				foundNextWord = true;
				break;
			}
		}

		if(foundNextWord) {
			console.log(word.text, 'is linked to', nextWord.text);
		}
		else {			
			// We're not at the end of the phrase nor do we have a link with the next word.
			// TODO: Pick 'random' fragment since it doesn't matter anyway.
		}

	}
	else {
		// Probably reached the end of the phrase. 
	}
}

Fragments.prototype.submit = function (sourceId, fragments) {

	var deferred = q.defer();
	var me = this;

	// Sort fragments on attribute 'start'
	fragments.sort(function (a, b) { return parseFloat(a.start) - parseFloat(b.start) });

	this.saveWords(fragments).then(function(savedWords) {

		me.saveFragments(sourceId, fragments, savedWords).then(function() {
			console.log('Done processing fragments... Phew...');
			deferred.resolve();
		});
		
	});

	return deferred.promise;
}

Fragments.prototype.saveFragments = function (sourceId, fragments, words) {
	// Save all fragments here
	var deferred = q.defer();

	Source.findById(sourceId).then(function(source) {
		console.log('Found source to use for fragments:', source);

		(function insertOne(index, savedFragments) {

			var fragment = fragments[index];
			var word = words[index];

			var query = { 'source': source, 'start': fragment.start, 'end': fragment.end, word: word },
			update = { },
			options = { upsert: true, new: true, setDefaultsOnInsert: true };
		
			Fragment.findOneAndUpdate(query, update, options, function (error, fragment) {
				if (error) {
					console.log(error);
					return;
				}

				console.log('Inserted or updated the fragment:', fragment);
				savedFragments.push(fragment);

				if(word.fragments.indexOf(fragment._id) == -1) {
					console.log('Linking word', word.text, 'to this fragment');
					word.fragments.push(fragment);
					word.save(function(err, result) {
						if(index == fragments.length - 1) {
							deferred.resolve(savedFragments);
						}
						else {
							insertOne(++index, savedFragments);
						}
					});
				}
				else {
					console.log('Word', word.text, 'is already linked to fragment', fragment);
					if(index == fragments.length - 1) {
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

			if(index == fragments.length - 1) {

				me.linkWords(savedWords).then(function() {
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
		
		if(index == words.length) {
			deferred.resolve(words);
		}
		else {

			var word = words[index];
			//console.log('Linking', word.text, 'to previous word');
			var previousIndex = index - 1;
			var previousWord = words[previousIndex];

			if(previousWord) {
				
				if(previousWord.links.indexOf(word._id) == -1) {
					previousWord.links.push(word);
					
					previousWord.save(function(err) {
						if(err) {console.log(err);}
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

Fragments.prototype.getFragmentsBySource = function(source) {
	var deferred = q.defer();

	Fragment.find({'source': source}).populate('word').then(function(fragments) {
		console.log('Found fragments by source', source, fragments);
		deferred.resolve(fragments);
	});

	return deferred.promise;
}

module.exports = new Fragments();