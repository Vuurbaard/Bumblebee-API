// Dijkstra shizzle
const Graph = require('node-dijkstra'); // https://github.com/albertorestifo/node-dijkstra
const route = new Graph();

// Database shit
const config = require('./config/database');
const mongoose = require('mongoose');
const Fragment = require('./models/fragment');
const Word = require('./models/word');
const Source = require('./models/source');

mongoose.connect(config.database);

// File stuff
const ffmpeg = require('fluent-ffmpeg');
const audioconcat = require('audioconcat');
const guid = require('guid');


function magic(words) {

	var nodes = new Array();

	// Generate the nodes
	for (var word of words) {
		for (var fragment of word.fragments) {

			var node = {
				name: word.text + " (source " + fragment.source + ")",
				word: word,
				id: fragment.id,
				source: fragment.source,
				edges: new Array()
			}

			console.log('generated node', node.name);
			nodes.push(node);
		}
	}

	// Generate the edges
	for (var node of nodes) {
		for (var link of node.word.links) {

			// find every node with the same word
			var linkedNodes = nodes.filter(function (linkedNode) {
				return link.text == linkedNode.word.text;
			});

			for (var linkedNode of linkedNodes) {
				node.edges.push({ node: linkedNode, cost: 1 });
			}
		}
	}

	// Calculate costs
	for (var node of nodes) {

		for (var edge of node.edges) {
			if (node.source != edge.node.source) {
				edge.cost = 2;
			}
		}

		var traces = traceEdges(node, new Array());
		//console.log('traces for', node.name, traces);

		for (var edge of traces) {
			var cost = 1 / traces.length;
			if (cost < edge.cost && cost < 1) {
				edge.cost = cost;
			}
		}
	}

	// Convert the shit to the node-dijkstra library structure
	for (var node of nodes) {

		var edges = {};

		for (var edge of node.edges) {
			edges[edge.node.id] = edge.cost;
		}

		console.log('node:', node.id, 'edges:', edges);

		route.addNode(node.id, edges);
	}


	var fragments = new Array();

	var startWord = words[0];
	var endWord = words[words.length - 1];

	if (startWord != endWord) {
		var paths = new Array();

		for (var startFragment of startWord.fragments) {
			//var startNodeName = startWord.text + " (source " + startFragment.source + ")";
			var startNodeName = startFragment.id;

			for (var endFragment of endWord.fragments) {
				//var endNodeName = endWord.text + " (source " + endFragment.source + ")";
				var endNodeName = endFragment.id;

				var path = route.path(startNodeName, endNodeName, { cost: true });

				if (path.score != 0) {
					paths.push(path);
				}

			}
		}

		console.log("paths:", paths);

		// Sort paths on score, lowest first
		paths.sort(function (a, b) { return (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0); });

		// Chose random path, with the highest score
		var pathsWithLowestScore = paths.filter(function (path) { return path.score == paths[0].score; });
		var random = Math.floor(Math.random() * pathsWithLowestScore.length);
		var path = pathsWithLowestScore[random];
		console.log("picking path:", path);

		// Get all the fragments and add them to the array
		for (var fragment of path.path) {
			fragments.push(fragment);
		}
	}
	else {
		// Just one word, so let's pick a random fragment of it.
		var random = Math.floor(Math.random() * startWord.fragments.length);
		var fragment = startWord.fragments[random];
		console.log('just one word, so picked random fragment:', fragment);
		fragments.push(fragment.id);
	}

	return fragments;
}

function traceEdges(node, traces) {
	// console.log('starting trace for', node.name);

	for (var edge of node.edges) {

		if (edge.node.source.equals(node.source)) {
			// console.log('adding', edge, 'to traces');
			traces.push(edge);
			traceEdges(edge.node, traces);
		}
	}

	return traces;
}

function traceWordLinks(words) {
	var wordCombinations = new Array();

	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		var nextWord = words[i + 1];

		if (isWordLinked(word, nextWord)) {
			var combination = new Array();
			combination.push(word);

			// This word has a link to the next word, so we need to trace it to the deepest link level
			var traces = 1;
			while (isWordLinked(word, nextWord)) {
				combination.push(nextWord);

				word = words[i + traces];
				nextWord = words[i + traces + 1];
				traces++;
			}
			wordCombinations.push(combination);
			i += combination.length - 1;
		}
		else {
			wordCombinations.push([word]);
		}
	}

	//console.log('wordCombinations:', wordCombinations);
	return wordCombinations;
}

function isWordLinked(a, b) {
	if (!a || !b) { return false; }

	for (var linkedWord of a.links) {
		if (linkedWord.text == b.text) {
			return true;
		}
	}
	return false;
}

function blackmagic(input) {
	
	var input = input.toLowerCase();
	var input = input.split(' ');
	console.log('starting new blackmagic for', input);

	// Find the words in the database
	Word.find({ text: input }).populate('links').populate('fragments').populate('fragments.source').then(function (words) {

		// Database results are not ordered, let's order them
		var orderedWords = new Array();
		for (var word of input) {
			var w = words.find(function (w) {
				return word == w.text;
			});
			orderedWords.push(w);
		}

		console.log('ordered words:', orderedWords);

		// Gather which words are linked together
		var linkedWords = traceWordLinks(orderedWords);
		console.log('linkedWords:', linkedWords); // i.e. [['please', 'let', 'this'], ['down']]

		// For each word in the combinations, do magic for each fragment
		var fragmentsToQuery = new Array();
		for (var words of linkedWords) {

			var fragments = magic(words);
			//console.log("fragments:", fragments);
			for (var fragmentId of fragments) {
				fragmentsToQuery.push(fragmentId);
			}
		}

		console.log('fragments to query:', fragmentsToQuery);

		Fragment.find({ '_id': {$in: fragmentsToQuery} }).populate('word').populate('source').then(function (fragments) {
			
			// THIS SHIT ISNT ORDERED EITHER... FFFFFFFFFFFFF
			fragments.sort(function(a, b) {
				return fragmentsToQuery.findIndex(x => a._id.equals(x)) - fragmentsToQuery.findIndex(x => b._id.equals(x));
			});

			console.log('fragments:', fragments);

			fileMagic(fragments);
		});
	});

}

function fileMagic(fragments) {

	// Generate temp files from fragments
	let tempFiles = new Array();

	let promises = fragments.map(function (fragment) {
		return new Promise(function (resolve, reject) {

			let filepath = __dirname + './audio/youtube/' + fragment.source.id + '.mp3';

			ffmpeg(filepath)
				.setStartTime(fragment.start)
				.setDuration(fragment.end - fragment.start)
				.output(__dirname + './audio/fragments/' + fragment._id + '.mp3')
				.on('end', function (err) {
					if (!err) {
						var order = fragments.indexOf(fragment);
						tempFiles.push({ order: order, file: fragment._id + '.mp3' });
						resolve();
						//console.log('conversion Done');
					}
				})
				.on('error', function (err) {
					console.log('ffmpeg error:', err);
					resolve();
				}).run();

		});
	});

	Promise.all(promises).then(function () {

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
			files.push(__dirname + "/audio/fragments/" + fragment.file);
		});

		//console.log('temp files:', files);

		// Concatenate the temp fragment files into one big one
		let outputfilename = guid.create() + '.mp3';
		audioconcat(files)
			.concat(__dirname + "./audio/temp/" + outputfilename)
			.on('start', function (command) {
				console.log('ffmpeg process started:', command)
			})
			.on('error', function (err, stdout, stderr) {
				console.error('Error:', err)
				console.error('ffmpeg stderr:', stderr)
				//res.status(500).json({ error: 'FFMpeg failed to process file' });
			})
			.on('end', function () {
				console.log('Audio created in:', "/audio/temp/" + outputfilename)
				// res.json({ file: "/fragments/" + outputfilename });
			})
	});
}

//blackmagic("let this work");
//blackmagic("please let me down");
//blackmagic("dont let me work");