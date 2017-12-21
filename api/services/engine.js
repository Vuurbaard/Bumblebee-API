var q = require('q');
var colors = require('colors');

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
	console.log('generating nodes...'.green);
	for (var word of words) {
		// console.log('=========');
		for (var fragment of word.fragments) {

			// console.log(word.text, " has fragments:",  fragment);

			var node = {
				name: word.text + "\r\n\(id " + fragment.id + ")" + "\r\n\(source " + fragment.source + ")" + "\r\n(start " + fragment.start + ")",
				word: word,
				id: fragment.id,
				source: fragment.source,
				start: fragment.start,
				edges: new Array(),
			}

			// if nodes doesnt contain this fragment yet, add it.
			var found = false;
			for (var n of nodes) {
				if (n.id == fragment.id) {
					found = true;
					break;
				}
			}
			if (!found) {
				//console.log('generated node', node.name);
				nodes.push(node);
			}

		}
	}

	// Sort nodes on source first and start time second
	nodes.sort(function (a, b) {
		if (a.source.id == b.source.id) {
			return (a.start < b.start) ? -1 : (a.start > b.start) ? 1 : 0;
		}
		else {
			return 0;
		}
	});
	//console.log('sorted on source/start:', nodes);

	for (var node of nodes) {
		console.log('node:'.yellow, node.word.text, node.id, node.start);
	}

	// Generate the edges
	console.log('generating edges...'.green);
	for (var node of nodes) {
		for (var link of node.word.links) {

			// find every node with the same link word
			var linkedNodes = nodes.filter(function (linkedNode) {
				return link.text == linkedNode.word.text && linkedNode.id != node.id;
			});

			for (var linkedNode of linkedNodes) {
				// check if we haven't added this edge before
				var alreadyAdded = false;
				for (var edge of node.edges) {
					if (edge.node.id == linkedNode.id)  {
						alreadyAdded = true;
						break;
					}
				}

				if (!alreadyAdded) {
					console.log('edge:'.yellow, node.word.text, node.id, '->'.yellow, linkedNode.word.text, linkedNode.id);
					node.edges.push({ node: linkedNode, cost: 1 });
				}
			}
		}
	}

	// console.log('removing all unnecessary edges'.green);
	// for (var node of nodes) {
	// 	var edges = this.traceEdgesBySourceAndStart(node, new Array());
	// 	// console.log(edges.length);
	// 	// console.log(edges);

	// 	for(var i = 0; i < edges.length; i++) {
	// 		console.log('removing edge:'.yellow, node.word.text, node.id, '->'.yellow, edges[i].node.word.text, edges[i].node.id);
	// 		delete edges[i];
	// 	}
	// }

	console.log("setting cost of edges to 2 if source doesn't match".green);
	// Set cost of edges to 2 if they do not share the same source
	for (var node of nodes) {
		for (var edge of node.edges) {
			if (node.source != edge.node.source) {
				edge.cost = 2;
			}
		}
	}

	// Calculate costs
	console.log('calculating the cost of all the edges...'.green);
	for (var node of nodes) {
		// Softens the score of edges if it shares the same source
		var edges = this.traceEdges(node, new Array());

		// console.log(edges.length);
		// console.log(edges);

		for (var edge of edges) {
			var cost = 1 / edges.length;
			if (cost < edge.cost && cost < 1) {
				console.log('updating cost of edge:'.yellow, node.word.text, node.id, '->'.yellow, edge.node.word.text, edge.node.id, 'to'.yellow, cost);
				edge.cost = cost;
			}
		}

		console.log(node.word.text.yellow, node.id.yellow);

		for (var edge of edges) {
			console.log(node.word.text, node.id, '->'.yellow, edge.node.word.text, edge.node.id, edge.cost);
		}
	}

	console.log('converting the shit to node-dijkstra library structure...'.green);
	// Convert the shit to the node-dijkstra library structure
	var debugGraph = new Array();
	for (var node of nodes) {

		var edges = {};
		for (var edge of node.edges) {
			edges[edge.node.id] = edge.cost;
		}

		var debugEdges = new Array();
		for (var edge of node.edges) {
			debugEdges.push({ id: edge.node.id, cost: edge.cost });
		}

		debugGraph.push({ 'node': { id: node.id, name: node.name }, edges: debugEdges });
		//console.log('node:', node.id, 'edges:', edges);

		route.addNode(node.id, edges);
	}

	// console.log(route.graph.map);

	var fragments = new Array();

	if (nodes.length > 1) {
		var startWord = words[0];
		var endWord = words[words.length - 1];
		var paths = new Array();

		console.log('startWord:', startWord.text, 'endWord:', endWord.text);

		for (var startFragment of startWord.fragments) {
			var startNodeName = startFragment.id;

			for (var endFragment of endWord.fragments) {
				var endNodeName = endFragment.id;

				var path = route.path(startNodeName, endNodeName, { cost: true });

				if (path.cost != 0) {
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

	return { fragments: fragments, nodes: debugGraph, path: path };
}

Engine.prototype.traceEdges = function (node, traces) {
	//console.log('starting trace for'.green, node.word.text, node.id);

	for (var edge of node.edges) {
		if (edge.node.source.equals(node.source)) {

			var alreadyAdded = false;
			for (var edge of traces) {
				if (edge.node.id == node.id) {
					alreadyAdded = true;
				}
			}

			if (!alreadyAdded) {
				console.log('adding'.yellow, node.word.text, node.id, '->'.yellow, edge.node.word.text, edge.node.id);
				traces.push(edge);
				this.traceEdges(edge.node, traces);
			}
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
	if (a._id.equals(b.id)) { return false; }
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

		console.log('fragments to query:', fragmentsToQuery);

		var fragments = new Array();
		(function findFragment(index) {
			Fragment.findById(fragmentsToQuery[index]).populate('word').populate({ path: 'word', populate: { path: 'links' } }).populate('source').then(function (fragment) {
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
					for (var combinedBySourceAndLink of combined) {
						//console.log('test:', combinedBySourceAndLink);
						var combinedFragment = { start: combinedBySourceAndLink[0].start, end: combinedBySourceAndLink[combinedBySourceAndLink.length - 1].end, id: combinedBySourceAndLink[0]._id + "-" + combinedBySourceAndLink[combinedBySourceAndLink.length - 1]._id, source: combinedBySourceAndLink[0].source };
						combinedFragments.push(combinedFragment);
					}

					//console.log('combined by start/end:', combinedFragments);

					me.fileMagic(combinedFragments, res, { nodes: magic.nodes, path: magic.path });
				}
			});
		})(0);

	}).catch(error => {
		console.error(error);
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

		console.log('temp files:', files);

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
				res.status(500).json({ error: 'FFMpeg failed to process file:' });
			})
			.on('end', function () {
				console.log('Audio created in:', "/audio/temp/" + outputfilename);

				res.json({ file: "/audio/temp/" + outputfilename, debug: debug });
			})
	});
}

module.exports = new Engine();