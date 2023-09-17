import { Document, ObjectId } from "mongoose";

export interface IProduct extends Document {
  title: string;
  short_title: string;
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
  count: number;
  supplier: ObjectId;
  features?: object[];
  colors?: string[];
  feature_title: string;
  feature_description: string;
}
