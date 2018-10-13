import { Document, Schema, Model, model } from "mongoose";
import { IUser } from ".";

export interface IApp extends Document {
    name: string;
	avatar: string;
	createdBy: IUser;
	token: string;
}

export var AppSchema: Schema = new Schema({
	name: { type: String, required: true, unique: true },
	avatar: { type: String },
	token: { type: String },
	createdAt: { type: Date },
	createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

AppSchema.pre("save", (next) => {
    if (!this.createdAt) {
        this.createdAt = new Date();
	}
	if (!this.token) {
        // this.token = random string
    }
    next();
});

export const App: Model<IApp> = model<IApp>("App", AppSchema);