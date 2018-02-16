const q = require('q');
var Source = require('../models/source');
var Fragment = require('../models/fragment');
var Word = require('../models/word');
var User = require('../models/user');
var mongoose = require('mongoose');

var Fragments = function () { };

Fragments.prototype.submit = function (sourceId, fragments, userId) {
	let deferred = q.defer();

	fragments.sort(function (a, b) { return parseFloat(a.start) - parseFloat(b.start) }); // Sort fragments on attribute 'start'

	this.saveFragments(fragments, sourceId, userId, deferred);

	return deferred.promise;
}

Fragments.prototype.saveFragments = async function (fragments, sourceId, userId, deferred) {

	// 1. Save the words first
	for (var fragment of fragments) {
		fragment.createdBy = userId;
		fragment.source = sourceId;
		fragment.newWord = await this.saveWord(fragment.word, userId);
	}

	// 2. Save the fragments
	for (var fragment of fragments) {
		if (fragment.id) {
			// This fragment already exists

			let existingFragment = await Fragment.findById(fragment.id).populate('word');

			if (fragment.newWord.text != existingFragment.word.text) {
				// console.log('pulling fragment', existingFragment.id, 'from word.fragments', existingFragment.word.fragments);

				// Remove/pull this fragment from the old word.
				await Word.findByIdAndUpdate(existingFragment.word._id, { $pull: { fragments: fragment.id } });

				// Since the word of the fragment has changed, update the fragment with the new word
				existingFragment.word = fragment.newWord;
				await existingFragment.save();

				// Also update the fragment its word with this fragment				
				existingFragment.word.fragments.push(fragment.id);
				await existingFragment.word.save();
			}
		}
		else {
			fragment.word = fragment.newWord;
			let newFragment = new Fragment(fragment);
			await newFragment.save();
			console.log('saved new fragment:', newFragment);

			newFragment.word.fragments.push(newFragment._id);
			await newFragment.word.save();

			fragment = newFragment;
		}
	}

	deferred.resolve(fragments);
}

Fragments.prototype.saveWord = async function (word, userId) {
	console.log('saving word for fragment:'.green, word);

	// FYI: word does not neccesary have to be saved here yet. We'll do that later
	let existingWord = await Word.findById(word._id);

	if (existingWord) {
		if (existingWord.text == word.text) {
			// Word is already in the database
			console.log('Word is already in the database');
		}
		else {
			// Someone changed the text of the word
			console.log('Someone changed the text of the word');
			existingWord = await Word.findOne({ text: word.text });

			if (!existingWord) {
				// If the word could not be found, create the word
				let newWord = new Word({ text: word.text, createdBy: userId });
				existingWord = await newWord.save();
			}
		}
	}
	else {
		existingWord = await Word.findOne({ text: word.text });
		if (!existingWord) {
			// We need to insert this word as it does not exist yet.
			let newWord = new Word({ text: word.text, createdBy: userId });
			existingWord = await newWord.save();
			console.log('Saved word', word);
		}
	}

	return existingWord;
}

Fragments.prototype.getFragmentsBySource = function (source) {
	var deferred = q.defer();

	Fragment.find({ 'source': source }).populate('word').then(function (fragments) {
		deferred.resolve(fragments);
	});

	return deferred.promise;
}

module.exports = new Fragments();