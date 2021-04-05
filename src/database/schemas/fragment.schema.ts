import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { Word } from './word.schema';
import { Source } from './source.schema';


@Schema()
export class Fragment {
	@Prop()
	start: string;

	@Prop()
	end: string;

	@Prop()
	active: boolean;

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Source' }] })
	source: Source;

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Word' }] })
	word: Word

	@Prop()
	createdAt: string;

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
	createdBy: User;

	@Prop()
	deletedAt: string;

}

export type FragmentDocument = Fragment & Document;

export const FragmentSchema = SchemaFactory.createForClass(Fragment);