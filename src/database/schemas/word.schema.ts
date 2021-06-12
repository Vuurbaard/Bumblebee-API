import { Document, Schema, Model, model } from "mongoose";
import { IFragment, IUser } from ".";

export interface IWord extends Document {
  text: string;
  fragments: [IFragment];
  createdAt: Date;
  createdBy: IUser;
}

export var WordSchema: Schema = new Schema({
  text: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  //fragments: [{ type: Schema.Types.ObjectId, ref: 'Fragment' }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date },
});

WordSchema.virtual("fragments", {
  ref: "Fragment", // The model to use
  localField: "_id", // `localField`
  foreignField: "word", // is equal to `foreignField`
  justOne: false,
});

WordSchema.pre("save", function (next) {
  if (!this.get("createdAt")) {
    this.set("createdAt", new Date());
  }
  next();
});

WordSchema.index({ text: 1 });
WordSchema.index({ fragments: 1 });

// UserSchema.methods.fullName = function (): string {
//     return (this.firstName.trim() + " " + this.lastName.trim());
// };

export const Word: Model<IWord> = model<IWord>("Word", WordSchema);
