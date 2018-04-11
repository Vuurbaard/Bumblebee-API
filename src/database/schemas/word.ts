import { Document, Schema, Model, model } from "mongoose";
import { IUser } from ".";
import { IFragment } from "./fragment";

export interface IWord extends Document {
	text: string;
	fragments: [IFragment];
	createdAt: Date;
	createdBy: IUser
}

export var WordSchema: Schema = new Schema({
	text: { type: String, required: true, lowercase: true, trim: true, unique: true },
	fragments: [{ type: Schema.Types.ObjectId, ref: 'Fragment' }],
	createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
	createdAt: { type: Date }
});

WordSchema.index({ text: 'text' });

WordSchema.pre("save", (next) => {
	let now = new Date();

	if (!this.createdAt) {
		this.createdAt = now;
	}
	next();
});

// UserSchema.methods.fullName = function (): string {
//     return (this.firstName.trim() + " " + this.lastName.trim());
// };

export const Word: Model<IWord> = model<IWord>("Word", WordSchema);