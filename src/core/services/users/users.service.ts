import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../../database/schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity } from '../../entities/user-entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async login(username, password): Promise<UserEntity> {
    let user = null;
    const _user = await this.userModel.findOne({ username: username });

    if (_user && (await bcrypt.compare(password, _user.password))) {
      user = _user;
    }

    return user ? new UserEntity(user) : null;
  }

  async register(): Promise<User> {
    return null;
  }

  static async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
}
