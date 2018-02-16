const q = require('q');
var Source = require('../models/source');
var Fragment = require('../models/fragment');
var Word = require('../models/word');
var User = require('../models/user');
var mongoose = require('mongoose');

var Fragments = function () { };

Fragments.prototype.submit = function (sourceId, fragments, userId) {

	let deferred = q.defer();

	// Sort fragments on attribute 'start'
	fragments.sort(function (a, b) { return parseFloat(a.start) - parseFloat(b.start) });

	console.log('Saving fragments...'.green);

	this.saveShit(fragments, sourceId, userId, deferred);

	return deferred.promise;
}

Fragments.prototype.saveShit = async function (fragments, sourceId, userId, deferred) {

	// 1. Save the words first
	for (var fragment of fragments) {
		fragment.createdBy = userId;
		fragment.source = sourceId;
		// fragment.oldWord = await Word.findOne({text: fragment.word.text});
		fragment.newWord = await this.saveWord(fragment.word, userId);
	}

	console.log('All the shit:', fragments);

	// 2. Save the fragments
	for (var fragment of fragments) {
		if (fragment.id) {
			// This fragment already exists
			

			let existingFragment = await Fragment.findById(fragment.id).populate('word');
			console.log('fragment already exists:', fragment);

			if (!existingFragment.word._id.equals(fragment.newWord._id)) {
				console.log('NEED TO TO SOME UPDATE MAGIC HERE'.red);

				console.log('pulling', existingFragment.id, 'from', existingFragment.word.fragments);
				// Remove relation from old word to fragment
				await Word.findOneAndUpdate(existingFragment.word._id, { $pull: { fragments: fragment.id } });

				// Update fragment with the new word relation
				let updatedFragment = await Fragment.findByIdAndUpdate(fragment.id, { start: fragment.start, end: fragment.end, word: fragment.newWord._id }, { new: true }).populate('word');
				
				updatedFragment.word.fragments.push(updatedFragment._id);
				await updatedFragment.word.save();
			}
			else {
				// Just return the fragment, aka do nothing here
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

	// FYI: fragment does not neccesary have to be saved here yet. We'll do that later

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
		//console.log('Found fragments by source', source, fragments);
		deferred.resolve(fragments);
	});

	return deferred.promise;
}

module.exports = new Fragments();