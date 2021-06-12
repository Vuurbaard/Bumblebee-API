import App from "../app";
import { IFragment, IUser, Source, User, Word } from "../database/schemas";
import { Fragment } from "../database/schemas";
import _ from "lodash";

App.boot().then(async () => {
  // Get all words to check for duplicates
  const words = await Word.find().populate("fragments");

  const grouped = _.groupBy(words, (item) => {
    return item.text;
  });

  // Remove all words with an occurance of 1 or less
  for (const k in grouped) {
    if (grouped[k].length <= 1) {
      delete grouped[k];
    }
  }

  const stats = {
    words: {
      duplicate: 0,
      emptyDeleted: 0,
      duplicateDeleted: 0,
    },
    fragments: {
      noReferenceDeleted: 0,
      duplicate: 0,
    },
  } as any;

  // Loop over all duplicate words
  for (const k in grouped) {
    const fragments = Array<IFragment>();
    const group = grouped[k];

    group.forEach((word) => {
      fragments.push(...word.fragments);
    });

    stats.words.duplicate = stats.words.duplicate + group.length;
    const firstElem = group.shift();

    if (firstElem) {
      // Update all fragments to point to the right word
      for (let i = 0; i < fragments.length; i++) {
        const fragment = fragments[i];

        if (fragment.word != firstElem._id) {
          console.log("Fragment ", fragment._id, " has incorrect word id");
          fragment.word = firstElem._id;
          fragment.set("word", firstElem._id);
          await fragment.save();
        }
      }
    }

    for (let i = 0; i < group.length; i++) {
      const word = group[i];
      if (word._id.toString() !== firstElem?._id.toString()) {
        await Word.findByIdAndDelete(word._id);
      }
    }

    stats.words.duplicateDeleted = stats.words.duplicateDeleted + group.length;
  }

  const fragments = (await Fragment.find()).filter((fragment) => {
    return fragment.word === null;
  });

  stats.fragments.noReferenceDeleted =
    stats.fragments.noReferenceDeleted + fragments.length;

  // stats.words.emptyDeleted = stats.words.emptyDeleted + emptyWords.length;
  // Find words with spaces
  const wordsWithSpaces = (await Word.find().populate("fragments")).filter(
    (word) => {
      return word.text.includes(" ");
    }
  );
  for (let i = 0; i < wordsWithSpaces.length; i++) {
    const word = wordsWithSpaces[i];
    for (const fragment of word.fragments) {
      const source = await Source.findById(fragment.source);
      if (source) {
        // console.log(
        //   "Word with fragment source: ",
        //   "https://youtube.com/?v=" + source.id
        // );
      }
    }
    // console.log("Word with space:", word, " with text '" + word.text + "'");
  }

  const allFragments = await Fragment.find();

  const uniqueFragments = _.groupBy(allFragments, (item) => {
    return item.source + ":" + item.start + ":" + item.end + "-" + item.word;
  });

  for (const k in uniqueFragments) {
    if (uniqueFragments[k].length <= 1) {
      delete uniqueFragments[k];
    }
  }

  for (const k in uniqueFragments) {
    const duplicateFragments = uniqueFragments[k];
    // Remove first, delete others
    const first = duplicateFragments.shift();

    stats.fragments.duplicate =
      stats.fragments.duplicate + duplicateFragments.length;

    for (const fragment of duplicateFragments) {
      if (first?._id.toString() !== fragment.toString()) {
        await Fragment.findByIdAndDelete(fragment._id);
      } else {
        console.log("heh");
      }
    }
  }

  console.log(stats);
  console.log("Duplicate fragments", Object.keys(uniqueFragments).length);
  console.log(uniqueFragments);

  process.exit();
});
