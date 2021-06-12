import { Word, IUser } from "../database/schemas";

class WordService {
  public async all(query?: any) {
    return Word.find(query || {}).populate("fragments");
  }

  public async getByID(id: string) {
    const word = await Word.findById(id).populate("fragments");
    return word ? word : {};
  }

  public async create(user: IUser, text: string) {
    return await new Word({ createdBy: user, text: text }).save();
  }

  public async update(user: IUser, id: string, fields: any) {
    const existingWord = await Word.findById(id).populate({
      path: "fragments",
    });

    if (existingWord) {
      if (existingWord.fragments.length > 0) {
        throw new Error(
          "Can not update this word because it has been used before. Try creating a new one"
        );
      } else {
        Word.findByIdAndUpdate(id, fields);
      }
    } else {
      throw new Error("Word not found.");
    }
  }
}

export default new WordService();
