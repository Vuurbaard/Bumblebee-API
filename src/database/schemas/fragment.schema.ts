import { Document, Schema, Model, model } from "mongoose";
import { ISource, IWord, IUser } from ".";

export interface IFragment extends Document {
	start: string;
	end: string;
	active: boolean;
	source: ISource;
	word: IWord;
	createdAt: Date;
	createdBy: IUser
}

export var FragmentSchema: Schema = new Schema({
    start: { type: Number, required: true },
	end: { type: Number, required: true },
	source: { type: Schema.Types.ObjectId, ref: 'Source'},
	word: { type: Schema.Types.ObjectId, ref: 'Word'},
	active: { type: Boolean, default: false },
	createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
	createdAt: { type: Date }
});

FragmentSchema.pre("save", (next) => {
	if (!this.createdAt) {
		this.createdAt = new Date();
	}
	next();
});

// UserSchema.methods.fullName = function (): string {
//     return (this.firstName.trim() + " " + this.lastName.trim());
// };

export const Fragment: Model<IFragment> = model<IFragment>("Fragment", FragmentSchema);