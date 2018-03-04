import { Document, Schema, Model, model } from "mongoose";

export interface IUser extends Document {
    email: string;
    username: string;
    password: string;
    isAdmin: boolean;
}

export var UserSchema: Schema = new Schema({
    name: { type: String },
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
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