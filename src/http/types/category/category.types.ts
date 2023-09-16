import { Document, ObjectId } from "mongoose";

export interface ICategory extends Document {
  title: string;
  images?: string[];
  children?: string;
  parent?: ObjectId;
}
