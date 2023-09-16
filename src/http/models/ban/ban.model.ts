import mongoose from "mongoose";
import { IBanUser } from "../../types/ban/ban.types";

const BanSchema = new mongoose.Schema<IBanUser>(
  {
    mobile: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const BanModel = mongoose.model("ban", BanSchema);
