import { Fragment } from '../../database/schemas/fragment.schema';
import { FragmentSet } from '../../database/schemas/fragmentSet.schema';

export class TTSresult {
  public words: Array<string> = [];
  public missing: Array<string> = [];
  public fragments: Array<Fragment> = [];
  public fragmentSet: FragmentSet = null;

  constructor() {}
}
