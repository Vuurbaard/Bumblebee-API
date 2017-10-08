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
		links: ["let"]
	},
	{
		text: "let",
		fragments: [{ source: 1 }, { source: 2 }],
		links: ["me", "this"]
	},
	{
		text: "this",
		fragments: [{ source: 1 }],
		links: ["work"]
	},
	{
		text: "work",
		fragments: [{ source: 1 }],
		links: []
	},
	{
		text: "dont",
		fragments: [{ source: 2 }],
		links: ["let"]
	},
	{
		text: "me",
		fragments: [{ source: 2 }],
		links: ["down"]
	},
	{
		text: "down",
		fragments: [{ source: 2 }],
		links: []
	},
]

function magic() {

	var combinations = new Array();
	combinations.push(words[0]); // please
	combinations.push(words[1]); // let
	combinations.push(words[5]); // me
	combinations.push(words[6]); // down

	for (var word of combinations) {
		console.log(word);


	}
}

magic();