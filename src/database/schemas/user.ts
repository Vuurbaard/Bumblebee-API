import { Document, Schema, Model, model } from "mongoose";

export interface IUser extends Document {
    email: string;
    name: string;
    username: string;
    password: string;
	avatar: string;
	roles: string[]
}

export var UserSchema: Schema = new Schema({
    name: { type: String },
    email: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
	createdAt: { type: Date },
	roles: { type: [String], default: [] },
});

UserSchema.pre("save", (next) => {
    let now = new Date();

    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

export const User: Model<IUser> = model<IUser>("User", UserSchema);