const Graph = require('node-dijkstra'); // https://github.com/albertorestifo/node-dijkstra
const route = new Graph();

// Example dijkstra library code:
// route.addNode('A', { B:1 })
// route.addNode('B', { A:1, C:2, D: 4 })
// route.addNode('C', { B:2, D:1 })
// route.addNode('D', { C:1, B:4 })
// route.path('A', 'D', {cost: true}) // => [ 'A', 'B', 'C', 'D' ] 


// phrases:
//		please let this work
//		dont let me down

// input: 
//		please let me down

// example db records
var database = [
	{
		text: "please",
		fragments: [{ id: '1', source: 1 }],
		links: ["let"],
	},
	{
		text: "let",
		fragments: [{ id: '2', source: 1 }, { id: '6', source: 2 }],
		links: ["this", "me"],
	},
	{
		text: "this",
		fragments: [{ id: '3', source: 1 }],
		links: ["work"],
	},
	{
		text: "work",
		fragments: [{ id: '4', source: 1 }],
		links: [],
	},
	{
		text: "dont",
		fragments: [{ id: '5', source: 2 }],
		links: ["let"],
	},
	{
		text: "me",
		fragments: [{ id: '7', source: 2 }],
		links: ["down"],
	},
	{
		text: "down",
		fragments: [{ id: '8', source: 2 }],
		links: [],
	},
]

function magic(words) {

	// var input = new Array();
	// input.push(database[0]); // please (1)
	// input.push(database[1]); // let (2)
	// input.push(database[5]); // me (2)
	// input.push(database[6]); // down (2)

	var nodes = new Array();

	// Generate the nodes
	for (var word of words) {	
		for(var fragment of word.fragments) {

			var node = {
				name: word.text + " (source " + fragment.source + ")",
				word: word,
				id: fragment.id,
				source: fragment.source, 
				edges: new Array()
			}

			nodes.push(node);
		}
	}

	// Generate the edges
	for(var node of nodes) {
		for(var link of node.word.links) {

			// find every node with the same word
			var linkedNodes = nodes.filter(function(linkedNode) {
				return link == linkedNode.word.text;
			});

			for(var linkedNode of linkedNodes) {
				node.edges.push({node: linkedNode, cost: 1});
			}
		}
	}

	// Calculate costs
	for(var node of nodes) {

		for(var edge of node.edges) {
			if(node.source != edge.node.source) {
				edge.cost = 2;
			}
		}

		var traces = traceEdges(node, new Array());
		//console.log('traces for', node.name, traces);

		for(var edge of traces) {
			var cost = 1 / traces.length;
			if(cost < edge.cost && cost < 1) {
				edge.cost = cost;
			}
		}
	}

	// Convert the shit to the node-dijkstra library structure
	for(var node of nodes) {

		var edges = {};

		for(var edge of node.edges) {
			edges[edge.node.id] = edge.cost; 
		}

		console.log('node:', node.id, 'edges:', edges);
		
		route.addNode(node.id, edges);
	}


	var fragments = new Array();

	var startWord = words[0];
	var endWord = words[words.length - 1];

	if(startWord != endWord) {
		var paths = new Array();

		for(var startFragment of startWord.fragments) {
			//var startNodeName = startWord.text + " (source " + startFragment.source + ")";
			var startNodeName = startFragment.id;
	
			for(var endFragment of endWord.fragments) {
				//var endNodeName = endWord.text + " (source " + endFragment.source + ")";
				var endNodeName = endFragment.id;
	
				var path = route.path(startNodeName, endNodeName, {cost: true});

				if(path.score != 0) {
					paths.push(path);
				}
				
			}
		}

		console.log("paths:", paths);

		// Sort paths on score, lowest first
		paths.sort(function(a,b) {return (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0);} );

		// Chose random path, with the highest score
		var pathsWithLowestScore = paths.filter(function(path) { return path.score == paths[0].score; });
		var random = Math.floor(Math.random() * pathsWithLowestScore.length);
		var path = pathsWithLowestScore[random];
		console.log("picking path:", path);

		// Get all the fragments and add them to the array
		for(var fragment of path.path) {
			fragments.push(fragment);
		}
	}
	else {
		// TODO: Just one word, so let's pick a random fragment of it.
		var random = Math.floor(Math.random() * startWord.fragments.length);
		var fragment = startWord.fragments[random];
		console.log('just one word, so picked random fragment:', fragment);
		fragments.push(fragment.id);
	}

	return fragments;
}

function traceEdges(node, traces) {
	//console.log('starting trace for', node.name);

	for(var edge of node.edges) {
		if(edge.node.source == node.source) {
			//console.log('adding', edge.name, 'to traces');
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

	return wordCombinations;
}

function isWordLinked(a, b) {
	if (!a || !b) { return false; }

	for (var linkedWord of a.links) {
		if(linkedWord == b.text) {
			return true;
		}
	}
	return false;
}

function blackmagic(input) {
	console.log('starting new blackmagic for', input);
	var input = input.toLowerCase();
	var input = input.split(' ');

	// Find the words in the database
	var words = new Array();
	for(var wordToFind of input) {
		var word = database.find(function(x) { return x.text == wordToFind; });
		words.push(word);
	}

	// Gather which words are linked together
	var linkedWords = traceWordLinks(words);
	console.log(linkedWords); // i.e. [['please', 'let', 'this'], ['down']]

	// For each word in the combinations, do magic for each fragment
	var fragmentsToQuery = new Array();
	for(var words of linkedWords) {

		var fragments = magic(words);
		//console.log("fragments:", fragments);
		for(var fragmentId of fragments) {
			fragmentsToQuery.push(fragmentId);
		}
	}
	
	console.log('fragments to query:', fragmentsToQuery);
}

blackmagic("please let me down");
// blackmagic("please let this down");
// blackmagic("dont let me work");