import { Document, ObjectId } from "mongoose";

export interface ICourse extends Document {
  title: string;
  short_text: string;
  text: string;
  images: string[];
  tags?: string[];
  category: ObjectId;
  likes?: ObjectId[];
  dislikes?: ObjectId[];
  bookmarks: ObjectId[];
  price: number;
  discount?: number;
  type: string;
  status?: string;
  teacher: ObjectId;
  chapters?: object[];
  students?: ObjectId[];
}
