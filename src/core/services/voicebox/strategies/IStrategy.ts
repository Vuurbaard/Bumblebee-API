import { TTSresult } from 'src/core/models/ttsresult';

export interface IStrategy {
  run(words: Array<string>): Promise<TTSresult>;
}
