import { Document } from "mongoose";

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  username: string;
  mobile: string;
  email: string;
  password: string;
  code: number;
  expiresIn: number;
  birthday: string;
  role: string;
  basket: object;
  accessToken: string;
  count: string;
}
