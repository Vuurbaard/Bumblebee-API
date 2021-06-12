import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FragmentSetDocument = FragmentSet;

@Schema()
export class FragmentSet extends Document {
  @Prop()
  hash: string;

  @Prop()
  text: string;

  @Prop()
  active: boolean;

  @Prop()
  fragments: Array<any>;
}

export const FragmentSetSchema = SchemaFactory.createForClass(FragmentSet);
