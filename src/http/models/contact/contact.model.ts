import mongoose from "mongoose";
import { IContact } from "../../types/contact/contact.types";

const ContactSchema = new mongoose.Schema<IContact>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    answer: { type: Boolean, required: true, default: false },
    body: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const ContactModel = mongoose.model("contacts", ContactSchema);
