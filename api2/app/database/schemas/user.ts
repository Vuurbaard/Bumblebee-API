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

// UserSchema.pre("save", function (next) {
//     let now = new Date();
//     if (!this.createdAt) {
//         this.createdAt = now;
//     }
//     next();
// });

// UserSchema.methods.fullName = function (): string {
//     return (this.firstName.trim() + " " + this.lastName.trim());
// };

export const User: Model<IUser> = model<IUser>("User", UserSchema);

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const config = require('../config/database');

// const UserSchema = mongoose.Schema({
//     name: { type: String },
//     email: { type: String, required: true },
//     username: { type: String, required: true },
// 	password: { type: String, required: true },
// 	isAdmin: { type: Boolean, default: false }
// });

// const User = module.exports = mongoose.model('User', UserSchema);

// module.exports.getUserById = function(id, callback) {
//     User.findById(id, callback);
// }

// module.exports.getUserByUsername = function(username, callback) {
//     const query = {username: username};
//     User.findOne(query, callback);
// }

// module.exports.addUser = function(user, callback) {
//     bcrypt.genSalt(10, (err, salt) => {
//         bcrypt.hash(user.password, salt, (err, hash) => {
//             if(err) { throw err; }
//             user.password = hash;
//             user.save(callback);
//         });
//     });
// }

// module.exports.comparePassword = function(candidatePassword, hash, callback) {
//     bcrypt.compare(candidatePassword, hash, (err, isMatched) => {
//         if(err) { throw err; }
//         callback(null, isMatched);
//     });
// }
