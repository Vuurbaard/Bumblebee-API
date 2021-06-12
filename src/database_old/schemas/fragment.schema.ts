import { Document, Schema, Model, model } from "mongoose";
import mongoose from "mongoose";

mongoose.set("useNewUrlParser", true);
const conn = mongoose.createConnection(
  "mongodb://" +
    process.env.MONGO_HOST +
    ":" +
    process.env.MONGO_PORT +
    "/bumblebee"
);

export interface IFragment extends Document {
  wordCount: number;
  phrase: string;
  end: number;
  start: number;
  id: string;
}

export var FragmentSchema: Schema = new Schema({
  wordCount: { type: Number, required: true },
  phrase: { type: String, required: true },
  end: { type: Number },
  start: { type: Number },
  id: { type: String },
});

export const Fragment: Model<IFragment> = conn.model<IFragment>(
  "Fragment",
  FragmentSchema
);
