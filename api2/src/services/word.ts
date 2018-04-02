import { IWord, Word } from '../database/schemas/word';

class WordService {

    public constructor() {

    }

    public async save(word: any, userId: string) {

        console.log('saving word:', word, 'for user', userId);

        // FYI: word does not neccesary have to be saved here yet. We'll do that later
        let existingWord = await Word.findById(word._id);

        if (existingWord) {
            if (existingWord.text == word.text) {
                // Word is already in the database
                console.log('Word is already in the database');
            }
            else {
                // Someone changed the text of the word
                console.log('Someone changed the text of the word');
                existingWord = await Word.findOne({ text: word.text });

                if (!existingWord) {
                    // If the word could not be found, create the word
                    let newWord = new Word({ text: word.text, createdBy: userId });
                    existingWord = await newWord.save();
                }
            }
        }
        else {
            existingWord = await Word.findOne({ text: word.text });
            if (!existingWord) {
                // We need to insert this word as it does not exist yet.
                let newWord = new Word({ text: word.text, createdBy: userId });
                existingWord = await newWord.save();
                console.log('Saved word', word);
            }
        }

        return existingWord;
    }

}

export default new WordService();