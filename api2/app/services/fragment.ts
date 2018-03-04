import q from 'q';
import { IFragment, Fragment } from '../database/schemas/fragment';
import WordService from './word';
import { Word } from '../database/schemas/word';

class FragmentService {

    public constructor() {

    }

    public async save(fragments: [any], sourceId: string, userId: string) {
        //let deferred = q.defer();

        fragments.sort(function (a: any, b: any) { return parseFloat(a.start) - parseFloat(b.start) }); // Sort fragments on attribute 'start'

        console.log('saving fragments:', fragments);

        // 1. Save the words first
        for (var fragment of fragments) {
            fragment.createdBy = userId;
            fragment.source = sourceId;
            fragment.newWord = await WordService.save(fragment.word, userId);
        }

        // 2. Save the fragments
        for (var fragment of fragments) {
            if (fragment.id) {
                // This fragment already exists

                let existingFragment = await Fragment.findById(fragment.id).populate('word');

                if (fragment.newWord.text != existingFragment!.word.text) {
                    // console.log('pulling fragment', existingFragment.id, 'from word.fragments', existingFragment.word.fragments);

                    // Remove/pull this fragment from the old word.
                    await Word.findByIdAndUpdate(existingFragment!.word._id, { $pull: { fragments: fragment.id } });

                    // Since the word of the fragment has changed, update the fragment with the new word
                    existingFragment!.word = fragment.newWord;
                    await existingFragment!.save();

                    // Also update the fragment its word with this fragment				
                    existingFragment!.word.fragments.push(fragment.id);
                    await existingFragment!.word.save();
                }
            }
            else {
                fragment.word = fragment.newWord;
                let newFragment = new Fragment(fragment);
                await newFragment.save();
                console.log('saved new fragment:', newFragment);

                newFragment.word.fragments.push(newFragment._id);
                await newFragment.word.save();

                fragment = newFragment;
            }
        }

        return fragments;
        //return deferred.promise;
    }

}

export default new FragmentService();