import { ICategory } from "../../types/category/category.types";

import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    title: { type: String, required: true, unique: true },
    images: { type: [String],required: false, default: [] },
    parent: {
      type: mongoose.Types.ObjectId,
      ref: "categories",
      required: false,
      default: undefined,
    },
  },
  {
    id: false,
    toJSON: {
      virtuals: true,
    },
  }
);

CategorySchema.virtual("children", {
  ref: "categories",
  localField: "_id",
  foreignField: "parent",
});

export const CategoryModel = mongoose.model("categories", CategorySchema);
