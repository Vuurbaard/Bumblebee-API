import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Fragment } from './fragment.schema';

export type FragmentSetDocument = FragmentSet;

@Schema()
export class FragmentSet extends Document  {
	@Prop()
	hash: string;

	@Prop()
	text: string;

	@Prop()
	active: boolean;

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fragment' }] })
	fragments: Fragment[];

}



export const FragmentSetSchema = SchemaFactory.createForClass(FragmentSet);