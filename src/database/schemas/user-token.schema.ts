import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

@Schema()
export class UserToken extends Document {
  @Prop()
  token: string;

  @Prop({ type: Date, required: true })
  valid_till: Date;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}

export type UserTokenDocument = UserToken & Document;

export const UserTokenSchema = SchemaFactory.createForClass(UserToken);
