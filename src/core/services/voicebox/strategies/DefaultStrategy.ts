import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TTSresult } from 'src/core/models/ttsresult';
import { Fragment, FragmentDocument } from 'src/database/schemas/fragment.schema';
import { Word, WordDocument } from 'src/database/schemas/word.schema';
import { IStrategy } from './IStrategy';

@Injectable()
export class DefaultStrategy implements IStrategy {

	constructor(@InjectModel(Word.name) private wordModel: Model<WordDocument>, @InjectModel(Fragment.name) private fragmentModel: Model<FragmentDocument>){
	}



	async run(words: Array<string>): Promise<TTSresult> {
		let rc = new TTSresult();

		let combinations = this.generateCombinations(words);

		const qWords = await this.wordModel.find({ text: { "$in" : combinations} }).populate({ path: 'fragments', model: 'Fragment', populate: { path: 'word', model: 'Word' } }).populate({ path: 'fragments', model: 'Fragment', populate: { path: 'source', model: 'Source' } });
		const orderedWords = this.orderWordsFromDatabase(combinations, qWords);
		const traces = await this.trace(orderedWords);
		// Shuffle traces
		this.shuffle(traces);

		// Order them by length so long combinations will go first
		traces.sort(function (a, b) {
			return b.length - a.length;
		});

		let findPath = this.findTraces(words, traces);

		// words variable has transformed into array with strings or objects. Check for strings to determine missing words

		rc.missing = words.filter((word) => {
			return (typeof word === 'string')
		})

		rc.words = words;
		rc.fragments = findPath;

		return rc;
	}
	
	private findTraces(input:Array<string>, words: Array<any[]>){
		for (const traces of words) {

			if (input.length == 0) { break; }

			// Build array of words from this specific trace so we can match it with the input
			const wordsFromTrace = [];
			for (const trace of traces) {
				wordsFromTrace.push(trace.word.text);
			}

			// LogService.info('[VoiceBox]', 'trying to remove:', wordsFromTrace, 'from', inputToProcess);
			

			if (wordsFromTrace.length > 0) {
				// Find the first word
				let start = 0;
				let index = -1;
				while (input.indexOf(wordsFromTrace[0], start) >= 0) {
					const ind = input.indexOf(wordsFromTrace[0], start);
					// Sanity check
					if (input.length >= (ind + wordsFromTrace.length)) {
						let br = false;
						let indx = ind;
						for (const word of wordsFromTrace) {
							if (input[indx] == word) {
								indx = indx + 1;
							}
							else {
								br = true;
								break;
							}
						}
						if (!br) {
							start = ind + 1;
							index = ind;
						}
						start = ind + 1;
					}
					else {
						// Break the while loop
						start = ind + 1;
					}
				}

				if (index >= 0) {

					// Replace words with fragments in inputToProcess
					input.splice(index, wordsFromTrace.length);
					for (const trace of traces.reverse()) {
						input.splice(index, 0, trace);
					}

				}
			}
		}

		let fragmentsToReturn = input as Array<any>;
		fragmentsToReturn = fragmentsToReturn.map(fragment => {
			if (typeof fragment == "string") {
				fragment = { text: fragment, found: false }
			}

			return fragment;
		});

		return fragmentsToReturn;
	}

	private shuffle(a: Array<any>){
		let j, x, i;
		for (i = a.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = a[i];
			a[i] = a[j];
			a[j] = x;
		}	
	}

	private async trace(words: Word[]){
		const traces: Array<any[]> = [];

		const promises = [] as any[];

		words.forEach((word, i) => {

			word.fragments.forEach((fragment) => {
				promises.push(this.traceFragments(i, words, fragment));
			})
		})

		await Promise.all(promises).then(values => {
			for(const item of values){
				traces.push(item);
			}
		})

		// We want the ones with the most entries at the top of the array, so let's sort on length.
		traces.sort(function (a, b) {
			return b.length - a.length;
		});


		return traces;
	}

	private async traceFragments(index: number, words: Word[], fragment: Fragment, traces?: Fragment[]) {
		// index = current word index
		// words = the word array
		// fragment = the current fragment we need to start a trace for
		// traces = array containing all the fragments we've traced

		const nextWord = words[index + 1];
		if (!traces) {
			traces = [];
			traces.push(fragment);
		}

		// LogService.info('[VoiceBox]', 'tracing fragment', fragment.id);

		if (nextWord) {
			for (const nextFragment of nextWord.fragments) {

				if (nextFragment.source != null && nextFragment.source.equals(fragment.source) && Number(nextFragment.start) > Number(fragment.start) && traces.filter(trace => (trace.id == nextFragment.id)).length == 0) {
					
					const fragmentsInBetween = await this.fragmentModel.countDocuments({
						start: { $gt: fragment.start, $lt: nextFragment.start },
						source: fragment.source
					});


					//LogService.info('fragmentsInBetween:'.red, fragmentsInBetween);

					if (fragmentsInBetween == 0) {
						//LogService.info('[VoiceBox]', fragment.id, '(' + fragment.word.text + " " + fragment.start + ')', 'source is same as', nextFragment.id, '(' + nextFragment.word.text + " " + nextFragment.start + ')');
						traces.push(nextFragment);
						await this.traceFragments(index + 1, words, nextFragment, traces);
					}
				}
			}
		}

		return traces;
	}

	private orderWordsFromDatabase(combinations: Array<string>, words: Word[]){
		// Database results are not ordered, let's order them
		const orderedWords = new Array<Word>();
		for (const word of combinations) {
			const w = words.find(function (w : Word) { return word == w.text; });
			if (w) { orderedWords.push(w); }
		}

		return orderedWords;
	}


	private generateCombinations(words: Array<any>): Array<string>{
		let combinations = [];
		// Generate combinations
		for (let start = 0; start < words.length; start++) {
			let phrase = "";
			for (let i = start; i < words.length; i++) {
				phrase = phrase + words[i] + " ";
				combinations.push(phrase.substring(0, phrase.length - 1));
			}
		}

		return combinations;
	}

}
