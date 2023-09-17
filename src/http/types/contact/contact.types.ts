import { Document, ObjectId } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  answer?: string;
  body: string;
}
