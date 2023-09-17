import mongoose from "mongoose";
import { IProduct } from "../../types/product/product.types";

const FeatureSchema = new mongoose.Schema({
  feature_title: { type: String, required: true },
  feature_description: { type: String, required: true },
});

const Features = new mongoose.Schema({
  feature_detail: { type: [FeatureSchema], default: [] },
});

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    title: { type: String, required: true },
    short_title: { type: String, required: true },
    text: { type: String, required: true },
    short_text: { type: String, required: true },
    images: { type: [String], required: true },
    tags: { type: [String], default: [] },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    likes: { type: [mongoose.Types.ObjectId], ref: "user", default: [] },
    dislikes: { type: [mongoose.Types.ObjectId], ref: "user", default: [] },
    bookmarks: { type: [mongoose.Types.ObjectId], ref: "user", default: [] },
    price: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    count: { type: Number },
    supplier: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    features: { type: Features },
    colors: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

ProductSchema.index({
  title: "text",
  short_title: "text",
  text: "text",
  short_text: "text",
  tags: "text",
});

export const ProductModel = mongoose.model("products", ProductSchema);
