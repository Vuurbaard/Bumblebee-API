import { IWord, Word } from '../database/schemas/word';
import { IUser } from '../database/schemas';


class WordService {

	public constructor() { }

	public async all(query?: any) {
		return Word.find(query || {}).populate('fragments');
	}

	public async getByID(id: string) {
		let word = await Word.findById(id).populate('fragments');
		return word ? word : {}
	}

	public async create(user: IUser, text: string) {
		return await new Word({ createdBy: user, text: text }).save();
	}

	public async update(user: IUser, id: string, fields: any) {

		let existingWord = await Word.findById(id).populate({ path: 'fragments' });

		if (existingWord) {
			if(existingWord.fragments.length > 0) {
				throw new Error('Can not update this word because it has been used before. Try creating a new one');
			}
			else {
				Word.findByIdAndUpdate(id, fields);
			}
			
		}
		else {
			throw new Error('Word not found.');
		}
	}

	// public async save(word: UnprocessedWord, userId: string) {

	// 	console.log('saving word:', word, 'for user', userId);

	// 	// FYI: word does not neccesary have to be saved here yet. We'll do that later
	// 	let existingWord = await Word.findById(word._id);

	// 	if (existingWord) {
	// 		if (existingWord.text == word.text) {
	// 			// Word is already in the database
	// 			console.log('Word is already in the database');
	// 		}
	// 		else {
	// 			// Someone changed the text of the word
	// 			console.log('Someone changed the text of the word');
	// 			existingWord = await Word.findOne({ text: word.text });

	// 			if (!existingWord) {
	// 				// If the word could not be found, create the word
	// 				let newWord = new Word({ text: word.text, createdBy: userId });
	// 				existingWord = await newWord.save();
	// 			}
	// 		}
	// 	}
	// 	else {
	// 		existingWord = await Word.findOne({ text: word.text });
	// 		if (!existingWord) {
	// 			// We need to insert this word as it does not exist yet.
	// 			let newWord = new Word({ text: word.text, createdBy: userId });
	// 			existingWord = await newWord.save();
	// 			console.log('Saved word', word);
	// 		}
	// 	}

	// 	return existingWord;
	// }

}

export default new WordService();