import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import {
  Fragment,
  FragmentDocument,
} from 'src/database/schemas/fragment.schema';
import { FragmentSet } from 'src/database/schemas/fragmentSet.schema';

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
