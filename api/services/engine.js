var q = require('q');

// Dijkstra shizzle
const Graph = require('node-dijkstra'); // https://github.com/albertorestifo/node-dijkstra
const route = new Graph();

// Database shit
const Fragment = require('../models/fragment');
const Word = require('../models/word');
const Source = require('../models/source');

// File stuff
const ffmpeg = require('fluent-ffmpeg');
const audioconcat = require('audioconcat');
const guid = require('guid');

var Engine = function () { };

Engine.prototype.magic = function (words) {

	var nodes = new Array();

	// Generate the nodes
	for (var word of words) {
		for (var fragment of word.fragments) {

			var node = {
				name: word.text + "\r\n\(source " + fragment.source + ")",
				word: word,
				id: fragment.id,
				source: fragment.source,
				start: fragment.start,
				edges: new Array(),
			}

			console.log('generated node', node.name);
			nodes.push(node);
		}
	}

	console.log('unsorted on source/start:', nodes);
	// Sort nodes on source first and start time second
	nodes.sort(function (a, b) { 
		if(a.source.id == b.source.id)
		{
			return (a.start < b.start) ? -1 : (a.start > b.start) ? 1 : 0;
		}
		else
		{
			return 0;
			//return (a.start < b.start) ? -1 : 1;
		}
	});

	console.log('sorted on source/start:', nodes);


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

		var traces = this.traceEdges(node, new Array());
		//console.log('traces for', node.name, traces);

		// TODO: Soften the score even if word is not linked but shares the same source
		for (var edge of traces) {
			var cost = 1 / traces.length;
			if (cost < edge.cost && cost < 1) {
				edge.cost = cost;
			}
		}
	}

	// Convert the shit to the node-dijkstra library structure
	var debugGraph = new Array();
	for (var node of nodes) {

		var edges = {};

		for (var edge of node.edges) {
			edges[edge.node.id] = edge.cost;
		}

		debugGraph.push({node: node, edges: edges});
		//console.log('node:', node.id, 'edges:', edges);

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

	return {fragments:fragments, nodes: debugGraph, path: path };
}

Engine.prototype.traceEdges = function (node, traces) {
	// console.log('starting trace for', node.name);

	for (var edge of node.edges) {

		if (edge.node.source.equals(node.source)) {
			// console.log('adding', edge, 'to traces');
			traces.push(edge);
			this.traceEdges(edge.node, traces);
		}
	}

	return traces;
}

Engine.prototype.traceWordLinks = function (words) {
	var wordCombinations = new Array();

	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		var nextWord = words[i + 1];

		if (this.isWordLinked(word, nextWord)) {
			var combination = new Array();
			combination.push(word);

			// This word has a link to the next word, so we need to trace it to the deepest link level
			var traces = 1;
			while (this.isWordLinked(word, nextWord)) {
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

Engine.prototype.isWordLinked = function (a, b) {
	if (!a || !b) { return false; }

	for (var linkedWord of a.links) {
		if (linkedWord.text == b.text) {
			
			return true;
		}
	}
	return false;
}

Engine.prototype.traceFragmentsBySameSourceAndWordLink = function (fragments) {
	var combinations = new Array();

	for (var i = 0; i < fragments.length; i++) {
		var fragment = fragments[i];
		var nextFragment = fragments[i + 1];

		if (this.isFragmentLinkedBySource(fragment, nextFragment) && this.isWordLinked(fragment.word, nextFragment.word)) {
			var combination = new Array();
			combination.push(fragment);

			// This fragment has a link to the next fragment by source, so we need to trace it to the deepest link level
			var traces = 1;
			while (this.isFragmentLinkedBySource(fragment, nextFragment) && this.isWordLinked(fragment.word, nextFragment.word)) {
				combination.push(nextFragment);

				fragment = fragments[i + traces];
				nextFragment = fragments[i + traces + 1];
				traces++;
			}
			combinations.push(combination);
			i += combination.length - 1;
		}
		else {
			combinations.push([fragment]);
		}
	}

	//console.log('wordCombinations:', wordCombinations);
	return combinations;
}

Engine.prototype.isFragmentLinkedBySource = function (a, b) {
	if (!a || !b) { return false; }
	if(a._id.equals(b.id)) { return false; }
	return a.source._id.equals(b.source._id);
}

Engine.prototype.blackmagic = function (input, res) {

	var me = this;
	var input = input.toLowerCase();
	var input = input.split(' ');
	console.log('starting new blackmagic for', input);

	// Find the words in the database
	Word.find({ text: input }).populate('links').populate('fragments').populate('fragments.source').then(function (words) {

		console.log('words:', words);

		if (words.length == 0) {
			res.status(422).json({ error: 'Could not find any matching words' });
		}

		// Database results are not ordered, let's order them
		var orderedWords = new Array();
		for (var word of input) {
			var w = words.find(function (w) {
				return word == w.text;
			});
			if (w) {
				orderedWords.push(w);
			}
		}

		//console.log('ordered words:', orderedWords);

		// Gather which words are linked together
		var linkedWords = me.traceWordLinks(orderedWords);
		//console.log('linkedWords:', linkedWords); // i.e. [['please', 'let', 'this'], ['down']]

		// For each word in the combinations, do magic for each fragment
		var fragmentsToQuery = new Array();
		for (var words of linkedWords) {

			var magic = me.magic(words);

			//console.log("fragments:", magic.fragments);
			for (var fragmentId of magic.fragments) {
				fragmentsToQuery.push(fragmentId);
			}
		}

		console.log('fragments to query:', fragmentsToQuery.length);

		var fragments = new Array();
		(function findFragment(index) {
			Fragment.findById(fragmentsToQuery[index]).populate('word').populate({path: 'word', populate: { path: 'links' }}).populate('source').then(function (fragment) {
				fragments.push(fragment);

				if (index != fragmentsToQuery.length - 1) {
					findFragment(++index);
				}
				else {
					//console.log('ordered fragments:', fragments);
					//me.fileMagic(fragments, res);

					// Combine fragments that have the same source so it will play fluently
					var combined = me.traceFragmentsBySameSourceAndWordLink(fragments);

					//console.log('combined:', combined);
					
					var combinedFragments = new Array();
					for(var combinedBySourceAndLink of combined) {
						//console.log('test:', combinedBySourceAndLink);
						var combinedFragment = {start: combinedBySourceAndLink[0].start, end: combinedBySourceAndLink[combinedBySourceAndLink.length - 1].end, id: combinedBySourceAndLink[0]._id + "-" + combinedBySourceAndLink[combinedBySourceAndLink.length - 1]._id, source: combinedBySourceAndLink[0].source};
						combinedFragments.push(combinedFragment);
					}

					//console.log('combined by start/end:', combinedFragments);

					me.fileMagic(combinedFragments, res, {nodes: magic.nodes, path: magic.path});
				}
			});
		})(0);

	});

}

Engine.prototype.fileMagic = function (fragments, res, debug) {

	// Generate temp files from fragments
	let tempFiles = new Array();

	let promises = fragments.map(function (fragment) {
		return new Promise(function (resolve, reject) {

			let filepath = __dirname + '/../audio/youtube/' + fragment.source.id + '.mp3';

			ffmpeg(filepath)
				.setStartTime(fragment.start)
				.setDuration(fragment.end - fragment.start)
				.output(__dirname + '/../audio/fragments/' + fragment.id + '.mp3')
				.on('end', function (err) {
					if (!err) {
						var order = fragments.indexOf(fragment);
						tempFiles.push({ order: order, file: fragment.id + '.mp3' });
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
			files.push(__dirname + "/../audio/fragments/" + fragment.file);
		});

		//console.log('temp files:', files);

		// Concatenate the temp fragment files into one big one
		let outputfilename = guid.create() + '.mp3';
		audioconcat(files)
			.concat(__dirname + "/../audio/temp/" + outputfilename)
			.on('start', function (command) {
				console.log('ffmpeg process started:', command)
			})
			.on('error', function (err, stdout, stderr) {
				console.error('Error:', err)
				console.error('ffmpeg stderr:', stderr)
				res.status(500).json({ error: 'FFMpeg failed to process file' });
			})
			.on('end', function () {
				console.log('Audio created in:', "/audio/temp/" + outputfilename);
				res.json({ file: "/audio/temp/" + outputfilename, debug: debug });
			})
	});
}

module.exports = new Engine();