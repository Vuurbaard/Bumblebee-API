// o(n2) kwadratisch
function test(input) {
	var s = 0;
	for (var start = 0; start < input.length; start++) {
		var t =  0;
		for (var i = start; i < input.length; i++) {
			t = t + input[i];

			if(t > s) {
				s = t;
			}
		}
	}

	console.log(s);
}

test([1, -3, 4, -2, -1, 6]);

// lineair = o(n)
// quadtratic = O(n2)
// derdemachts = o(n3)

// n = lineair
// log n = tussen lineair en constant in
// n log n = tussen logoritmisch en kwadratisch in
// n2 kwadratisch 