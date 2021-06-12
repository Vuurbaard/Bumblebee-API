import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Fragment } from './fragment.schema';

@Schema()
export class Word extends Document {
  @Prop()
  text: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fragment' }] })
  fragments: Fragment[];
}

export type WordDocument = Word;

export const WordSchema = SchemaFactory.createForClass(Word);
