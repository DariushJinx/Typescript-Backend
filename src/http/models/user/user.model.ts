import mongoose from "mongoose";
import { IUser } from "../../types/user/user.types";

const CourseSchema = new mongoose.Schema({
  courseID: { type: mongoose.Types.ObjectId, ref: "course" },
  count: { type: Number, default: 1 },
});

const ProductSchema = new mongoose.Schema({
  productID: { type: mongoose.Types.ObjectId, ref: "products" },
  count: { type: Number, default: 1 },
});

const BasketSchema = new mongoose.Schema({
  products: { type: [ProductSchema], default: [] },
  courses: { type: [CourseSchema], default: [] },
});

const UserSchema = new mongoose.Schema<IUser>(
  {
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String, lowercase: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, lowercase: true },
    password: { type: String },
    code: {
      type: Number,
    },
    expiresIn: {
      type: Number,
    },
    birthday: { type: String },
    role: { type: String, default: "USER" },
    basket: { type: BasketSchema },
    accessToken: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const UserModel = mongoose.model("user", UserSchema);
