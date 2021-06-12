import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FragmentSet,
  FragmentSetDocument,
} from 'src/database/schemas/fragmentSet.schema';

@Injectable()
export class FragmentsetService {
  constructor(
    @InjectModel(FragmentSet.name)
    private fragmentSetModel: Model<FragmentSetDocument>,
  ) {}

  async byHash(hash: string) {
    return await this.fragmentSetModel.findOne({ hash: hash });
  }
}
