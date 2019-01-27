import { Document, Schema, Model, model } from "mongoose";
import { IUser } from ".";
import guid from 'guid';
import bcrypt from 'bcryptjs';

export interface IApp extends Document {
	name: string;
	avatar: string;
	createdBy: IUser;
	token: string;
}

export var AppSchema: Schema = new Schema({
	name: { type: String, required: true, unique: true },
	token: { type: String, unique: true },
	avatar: { type: String },
	createdAt: { type: Date },
	createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

AppSchema.pre('save', function (next) {

	if (!this.get('createdAt')) {
		this.set('createdAt', new Date());
	}
	if (!this.get('token')) {
		this.set('token', guid.create());
		//this.set('token', );
	}

	next();
});

export const App: Model<IApp> = model<IApp>("App", AppSchema);