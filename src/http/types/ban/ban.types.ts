import { Document } from "mongoose";

export interface IBanUser extends Document {
  mobile: string;
}
