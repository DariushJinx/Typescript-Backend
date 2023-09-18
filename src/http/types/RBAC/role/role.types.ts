import { Document, ObjectId } from "mongoose";

export interface IRole extends Document {
  title: string;
  description: string;
  permissions: ObjectId[];
}
