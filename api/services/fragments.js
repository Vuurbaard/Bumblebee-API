const q = require('q');
var Fragment = require('../models/fragment');

var Fragments = function () { };

Fragments.prototype.search = function (text) {

	var deferred = q.defer();

	Fragment.find(
		{ $text: { $search: text } },
		{ score: { $meta: "textScore" } }
	)
		.sort({ score: { $meta: 'textScore' } })
		.exec(function (err, results) {
			if (!err) {
				// console.log("results: ", results);
				deferred.resolve(results);
			}
			else {
				console.log(err);
				deferred.reject(err);
			}
		});

	return deferred.promise;
}

Fragments.prototype.getByID = function (id) {

	var deferred = q.defer();

	Fragment.find({ id: id }).then(fragments => {
		deferred.resolve(fragments);
	});

	return deferred.promise;
}

Fragments.prototype.submit = function (id, fragments) {

	var deferred = q.defer();

	// Sort fragments on attribute 'start'
	fragments.sort(function (a, b) { return parseFloat(a.start) - parseFloat(b.start) });

	let phrases = new Array();

	for (var start = 0; start < fragments.length; start++) {
		let phrase = "";
		let wordCount = 0;
		let startFragment = fragments[start];

		for (let i = start; i < fragments.length; i++) {
			let fragment = fragments[i];

			phrase = phrase + fragment.word.toLowerCase() + " ";
			wordCount++;

			if (!fragment._id) { // Don't push if it is already in the database
				phrases.push(new Fragment({
					id: id,
					start: startFragment.start,
					end: fragment.end,
					phrase: phrase.substring(0, phrase.length - 1),
					reviewed: false,
					wordCount: wordCount
				}));
			}

		}
	}

	// console.log('All possible phrases:');
	console.log(phrases);

	Fragment.insertMany(phrases)
		.then(function (mongooseDocuments) {
			deferred.resolve();

		})
		.catch(function (err) {
			console.log(err);
			deferred.reject();
		});

	return deferred.promise;
}

module.exports = new Fragments();