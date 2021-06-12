import { Fragment } from 'src/database/schemas/fragment.schema';
import { FragmentSet } from 'src/database/schemas/fragmentSet.schema';

export class TTSresult {
  public words: Array<string> = [];
  public missing: Array<string> = [];
  public fragments: Array<Fragment> = [];
  public fragmentSet: FragmentSet = null;

  constructor() {}
}
