import { Document, Schema, Model, model } from "mongoose";
import { IFragment } from "./fragment.schema";

export interface IFragmentSet extends Document {
  hash: string;
  text: string;
  fragments: IFragment[];
}

export const FragmentSetSchema: Schema = new Schema({
  hash: { type: String, required: true },
  text: { type: String, required: true },
  fragments: { type: Array },
});

FragmentSetSchema.pre("save", function (next) {
  next();
});

export const FragmentSet: Model<IFragmentSet> = model<IFragmentSet>(
  "FragmentSet",
  FragmentSetSchema
);
