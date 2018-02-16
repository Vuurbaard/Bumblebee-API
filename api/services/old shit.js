Fragments.prototype.saveFragments = function (sourceId, fragments, words, userId) {
	// Save all fragments here
	var deferred = q.defer();

	console.log('Saving fragments:'.green, fragments);

	Source.findById(sourceId).then(function (source) {
		//console.log('Found source to use for fragments:', source);

		(function insertOne(index, savedFragments, userId) {

			var fragment = fragments[index];
			var word = words[index];

			//console.log('======= saving fragment for word', fragment.word);
			//console.log(fragment);

			var query = { _id: fragment.id ? fragment.id : new mongoose.mongo.ObjectID() };
			var update = { start: fragment.start, end: fragment.end, word: word, source: source };
			var options = { upsert: true, setDefaultsOnInsert: true, new: true };

			Fragment.findOneAndUpdate(query, update, options, function (error, fragment) {

				if (error) {
					console.log(error);
					return;
				}

				//console.log('Inserted or updated the fragment:', fragment);
				savedFragments.push(fragment);

				if (word.fragments.indexOf(fragment._id) == -1) {
					//console.log('Linking word', word.text, 'to this fragment');
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
					//console.log('Word', word.text, 'is already linked to fragment', fragment);
					if (index == fragments.length - 1) {
						deferred.resolve(savedFragments);
					}
					else {
						insertOne(++index, savedFragments, userId);
					}
				}


			});

		})(0, new Array(), userId);
	});

	return deferred.promise;
}

Fragments.prototype.saveWords = function (fragments, userId) {
	var deferred = q.defer();
	var me = this;

	(function insertOne(index, savedWords, userId) {

		var fragment = fragments[index];
		console.log('Saving word', fragment.word);

		Word.findOne({ _id: fragment.word._id, 'text': fragment.word.text }, (err, word) => {
			if (err) {
				console.log(err);
				return;
			}
			if (word) {
				savedWords.push(word);
				console.log('Found existing word', word.text);

				if (index == fragments.length - 1) {

					me.linkWords(savedWords).then(function () {
						deferred.resolve(savedWords);
					});
				}
				else {
					insertOne(++index, savedWords, userId);
				}
			}
			if (!word) {
				// Insert
				let newWord = new Word({ 'text': fragment.word.text, createdBy: userId });
				newWord.save((err, word) => {
					savedWords.push(word);
					console.log('Inserted new word', word);

					if (index == fragments.length - 1) {

						me.linkWords(savedWords).then(function () {
							deferred.resolve(savedWords);
						});
					}
					else {
						insertOne(++index, savedWords, userId);
					}
				});
			}
		});

	})(0, new Array(), userId);

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
						//console.log('linked', previousWord.text, 'to', word.text);
						link(++index);
					});
				}
				else {
					//console.log(previousWord.text, 'is already linked to', word.text);
					link(++index);
				}

			}
			else {
				//console.log('Did not find previous word to link, skipping this.');
				link(++index);
			}
		}
	})(1); // Start at index 1 because we don't need to link the first result to anything

	return deferred.promise;
}