import { Document, ObjectId } from "mongoose";

export interface IOff extends Document {
  code: string;
  percent: string;
  product?: ObjectId;
  course?: ObjectId;
  max: number;
  uses: number;
  creator: ObjectId;
}
