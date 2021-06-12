import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../entities/user-entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import {
  UserToken,
  UserTokenDocument,
} from '../../../database/schemas/user-token.schema';

import * as moment from 'moment';
import { UserTokenEntity } from '../../entities/user-token-entity';

@Injectable()
export class UserTokenService {
  constructor(
    @InjectModel(UserToken.name)
    private userTokenModel: Model<UserTokenDocument>,
  ) {}
  async create(user: UserEntity) {
    return this.toEntity(
      await this.userTokenModel.create({
        token: crypto.randomBytes(64).toString('hex'),
        valid_till: moment().add(31, 'days').toDate(),
        created_at: moment().toDate(),
        user: user.model(),
      }),
    );
  }

  async findByToken(token: string) {
    const qToken = await this.userTokenModel
      .findOne({ token: token })
      .populate('user');

    return qToken ? new UserTokenEntity(qToken) : null;
  }
  async all() {
    return null;
  }

  toEntity(document: UserTokenDocument) {
    return new UserTokenEntity(document);
  }
}
