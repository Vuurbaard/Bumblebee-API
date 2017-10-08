// phrases:
//		please let this work
//		dont let me down

// input: 
//		please let me down

// example db records
var words = [
	{
		text: "please",
		fragments: [{ source: 1 }]
	},
	{
		text: "let",
		fragments: [{ source: 1 }, { source: 2 }]
	},
	{
		text: "this",
		fragments: [{ source: 1 }]
	},
	{
		text: "work",
		fragments: [{ source: 1 }]
	},
	{
		text: "dont",
		fragments: [{ source: 2 }]
	},
	{
		text: "me",
		fragments: [{ source: 2 }]
	},
	{
		text: "down",
		fragments: [{ source: 2 }]
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