import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema()
export class User {
	@Prop()
	name: string;

	@Prop()
	email: string;

	@Prop({ required: true, unique: true})
	username: string;

	@Prop()
	password: string;

	@Prop()
	isAdmin: boolean;

}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);