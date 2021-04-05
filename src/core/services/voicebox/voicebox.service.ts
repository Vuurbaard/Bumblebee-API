import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Word, WordDocument } from 'src/database/schemas/word.schema';

@Injectable()
export class VoiceboxService {



	constructor(@InjectModel(Word.name) private wordModel: Model<WordDocument>){

	}



	/**
	 * tts
	 */
	public async tts(text: string): Promise<any> {
		let words = this.sentenceToWords(text);
		// Get all fragments for these words
		let matches = await this.getMatchingWordsList(words);

		// Find longest string of words and pick some at random and fill in the others
		let missing = [];

		matches.forEach((match) => {
			if(match.fragments.length > 0){
				console.log(match.fragments);
			} else {
				missing.push(match.word);
			}
		});

		// console.log(matches)


		return {
			'lol': 'yes'
		};
	}



	private sentenceToWords(sentence: string): string[] {
		let rc = [];
		rc = sentence.trim().split(" ");


		return rc;
	}


	


	private async getMatchingWordsList(words: string[]){

		let qWords = await this.wordModel.find({ 'text' : { '$in' : words } }).populate('fragments').exec();

		let matches = [];


		words.forEach((word, index) => {
			matches.push({
				'word': word,
				'index': index,
				'fragments': qWords.filter((value, ind) => {
					return value.text === word;
				})
			});
		});

		return matches;
	}

}
