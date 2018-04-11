import { Document, Schema, Model, model } from "mongoose";

export interface IUser extends Document {
    externalId: string;
    email: string;
    name: string;
    username: string;
    password: string;
    isAdmin: boolean;
    avatar: string;
}

export var UserSchema: Schema = new Schema({
    name: { type: String },
    externalId: { type: String },
    email: { type: String },
    username: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    avatar: { type: String },
    createdAt: { type: Date }
});

UserSchema.pre("save", (next) => {
    let now = new Date();

    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

// UserSchema.methods.fullName = function (): string {
//     return (this.firstName.trim() + " " + this.lastName.trim());
// };

export const User: Model<IUser> = model<IUser>("User", UserSchema);