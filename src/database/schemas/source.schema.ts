import { Document, Schema, Model, model } from "mongoose";
import { IFragment, IUser } from ".";

export interface ISource extends Document {
	id: string;
	origin: string;
	fragments: [IFragment];
	createdAt: Date;
	createdBy: IUser;
}

export var SourceSchema: Schema = new Schema({
	id: { type: String, required: true, unique: true },
	origin: { type: String, required: true },
	createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
	createdAt: { type: Date }
});

SourceSchema.virtual('fragments', {
	ref: 'Fragment', // The model to use
	localField: '_id', // Find people where `localField`
	foreignField: 'source', // is equal to `foreignField`
	justOne: false
});

SourceSchema.set('toObject', { virtuals: true });
SourceSchema.set('toJSON', { virtuals: true });

SourceSchema.pre("save", function (next) {
	if (!this.get('createdAt')) {
		this.set('createdAt', new Date());
	}
	next();
});

// UserSchema.methods.fullName = function (): string {
//     return (this.firstName.trim() + " " + this.lastName.trim());
// };

export const Source: Model<ISource> = model<ISource>("Source", SourceSchema);