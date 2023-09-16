import { Document, ObjectId } from "mongoose";

export interface ICourseUser extends Document {
  course: ObjectId;
  user: ObjectId;
  price: number;
}
