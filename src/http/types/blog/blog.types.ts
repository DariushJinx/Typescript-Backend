import { Document, ObjectId } from "mongoose";

export interface IBlog extends Document {
  title: string;
  short_text: string;
  text: string;
  images: string[];
  tags?: string[];
  category: ObjectId;
  likes?: ObjectId[];
  dislikes?: ObjectId[];
  bookmarks: ObjectId[];
  author: ObjectId;
}
