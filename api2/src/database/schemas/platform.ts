import { Document, Schema, Model, model } from "mongoose";
import { IUser } from ".";
import { IFragment } from "./fragment";

export interface IPlatform extends Document {
	
}

export var PlatformSchema: Schema = new Schema({
	
	createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
	createdAt: { type: Date }
});

PlatformSchema.pre("save", (next) => {
	let now = new Date();

	if (!this.createdAt) {
		this.createdAt = now;
	}
	next();
});

export const Word: Model<IPlatform> = model<IPlatform>("Platform", PlatformSchema);