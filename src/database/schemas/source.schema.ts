import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Fragment } from './fragment.schema';

@Schema()
export class Source extends Document {
  @Prop()
  id: string;

  @Prop()
  origin: string;

  @Prop()
  createdAt: string;

  @Prop()
  deletedAt: string;
}

export type SourceDocument = Source & Document;

export const SourceSchema = SchemaFactory.createForClass(Source);
