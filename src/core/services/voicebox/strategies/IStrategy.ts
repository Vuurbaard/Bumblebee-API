import { TTSresult } from '../../../models/ttsresult';

export interface IStrategy {
  run(words: Array<string>): Promise<TTSresult>;
}
