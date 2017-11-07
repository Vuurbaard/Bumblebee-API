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
var words = [
	{
		text: "please",
		fragments: [{ source: 1 }],
		links: ["let"],
	},
	{
		text: "let",
		fragments: [{ source: 1 }, { source: 2 }],
		links: ["this", "me"],
	},
	{
		text: "this",
		fragments: [{ source: 1 }],
		links: ["work"],
	},
	{
		text: "work",
		fragments: [{ source: 1 }],
		links: [],
	},
	{
		text: "dont",
		fragments: [{ source: 2 }],
		links: ["let"],
	},
	{
		text: "me",
		fragments: [{ source: 2 }],
		links: ["down"],
	},
	{
		text: "down",
		fragments: [{ source: 2 }],
		links: [],
	},
]

function magic() {

	var input = new Array();
	input.push(words[0]); // please (1)
	input.push(words[1]); // let (2)
	input.push(words[5]); // me (2)
	input.push(words[6]); // down (2)

	var nodes = new Array();

	// Generate the nodes
	for (var word of input) {	
		for(var fragment of word.fragments) {

			var node = {
				name: word.text + " (source " + fragment.source + ")",
				word: word,
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
		console.log('traces for', node.name, traces);

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
			edges[edge.node.name] = edge.cost; 
		}

		console.log('node:', node.name, 'edges:', edges);
		
		route.addNode(node.name, edges);
	}

	var wat = route.path('please (source 1)', 'down (source 2)', {cost: true});
	console.log(wat);

}

magic();


function traceEdges(node, traces) {
	console.log('starting trace for', node.name);

	for(var edge of node.edges) {
		if(edge.node.source == node.source) {
			console.log('adding', edge.name, 'to traces');
			traces.push(edge);
			traceEdges(edge.node, traces);
		}
	}

	return traces;

}