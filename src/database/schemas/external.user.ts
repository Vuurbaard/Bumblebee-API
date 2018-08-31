import { Document, Schema, Model, model } from "mongoose";
import { IUser } from "./user";

export interface IExternalUser extends Document {
    externalId: string;
	user: IUser;
}

export var ExternalUserSchema: Schema = new Schema({
	externalId: { type: String },
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	createdAt: { type: Date },
});

ExternalUserSchema.pre("save", (next) => {
    let now = new Date();

    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

export const User: Model<IExternalUser> = model<IExternalUser>("ExternalUser", ExternalUserSchema);