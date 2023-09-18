import mongoose from "mongoose";
import { IOff } from "../../types/off/off.types";

const OffSchema = new mongoose.Schema<IOff>(
  {
    code: { type: String, required: true },
    percent: { type: String, required: true },
    product: { type: mongoose.Types.ObjectId, ref: "products" },
    course: { type: mongoose.Types.ObjectId, ref: "courses" },
    max: { type: Number, required: true },
    uses: { type: Number, required: true },
    creator: { type: mongoose.Types.ObjectId, ref: "user", required: true },
  },
  {
    timestamps: true,
  }
);

export const OffModel = mongoose.model("offs", OffSchema);
