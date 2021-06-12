import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  Fragment,
  FragmentDocument,
} from '../../../database/schemas/fragment.schema';
import { FragmentSet } from '../../../database/schemas/fragmentSet.schema';

@Injectable()
export class AudioService {
  constructor(
    @InjectModel(Fragment.name) private fragmentModel: Model<FragmentDocument>,
  ) {}

  async parseFragmentSet(fragmentSet: FragmentSet, format: string) {
    const fragmentIds = fragmentSet.fragments.filter((item) => {
      return isValidObjectId(item);
    });

    const fragments = await this.fragmentModel.find({
      _id: { $in: fragmentIds },
    });

    // Parse all fragments
  }
}
