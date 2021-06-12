import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FragmentSet,
  FragmentSetDocument,
} from '../../../database/schemas/fragmentSet.schema';
import { Word, WordDocument } from '../../../database/schemas/word.schema';
import { DefaultStrategy } from './strategies/DefaultStrategy';
import { IStrategy } from './strategies/IStrategy';
import * as crypto from 'crypto';
import { TTSresult } from '../../models/ttsresult';
import { AudioService } from '../audio/audio.service';

@Injectable()
export class VoiceboxService {
  protected strategies: Array<any> = [];

  constructor(
    @InjectModel(Word.name) private wordModel: Model<WordDocument>,
    @InjectModel(FragmentSet.name)
    private fragmentSetModel: Model<FragmentSetDocument>,
    private audioService: AudioService,
    private defaultStrat: DefaultStrategy,
  ) {
    this.strategies.push(defaultStrat);
  }

  /**
   * tts
   */
  public async tts(text: string): Promise<TTSresult> {
    const words = this.sentenceToWords(text);

    const strategy = this.getStrategy();

    const ttsresult = await strategy.run(words);

    // Cache combination for easier lookup in the future
    const fragmentSetHash = this.generateHash(ttsresult.fragments);

    let fragmentSet = await this.fragmentSetModel.findOne({
      hash: fragmentSetHash,
    });

    if (fragmentSet === null) {
      const fragments = ttsresult.fragments.filter((el) => {
        return el != null;
      });

      fragmentSet = new this.fragmentSetModel({
        hash: fragmentSetHash,
        text: text,
        active: true,
        fragments: fragments,
      });

      // console.log(fragmentSet);

      fragmentSet = await fragmentSet.save();
    }

    ttsresult.fragmentSet = fragmentSet;

    return ttsresult;
  }

  public async getAudio(fragmentSet: FragmentSet, format: string) {
    console.log('hey?');
    const audioResponse = await this.audioService.parseFragmentSet(
      fragmentSet,
      format,
    );
  }

  private getStrategy(): IStrategy {
    return this.strategies[0];
  }

  private sentenceToWords(sentence: string): Array<string> {
    return sentence.trim().split(' ');
  }

  private generateHash(fragments: Array<any>) {
    function compare(a: any, b: any) {
      if (a.order < b.order) return -1;
      if (a.order > b.order) return 1;
      return 0;
    }

    fragments.sort(compare);

    // We only need id's for the hash (we will concat them together)
    const content = fragments
      .map(function (item: any) {
        return item['id'] + item['start'] + item['end'];
      })
      .join(':');

    return crypto.createHash('sha1').update(content).digest('hex');
  }

  private async getMatchingWordsList(words: string[]) {
    const qWords = await this.wordModel
      .find({ text: { $in: words } })
      .populate('fragments')
      .exec();

    qWords.forEach((item) => {
      console.log(item);
    });

    const matches = [];

    words.forEach((word, index) => {
      matches.push({
        word: word,
        index: index,
        fragments: qWords.filter((value, ind) => {
          return value.text === word;
        }),
      });
    });

    return matches;
  }
}
