import mongoose from "mongoose";
import { IRole } from "../../../types/RBAC/role/role.types";

const roleSchema = new mongoose.Schema<IRole>(
  {
    title: { type: String, unique: true },
    description: { type: String, default: "" },
    permissions: {
      type: [mongoose.Types.ObjectId],
      ref: "permissions",
      default: [],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

roleSchema.virtual("permission_details", {
  ref: "permissions",
  localField: "_id",
  foreignField: "permissions",
});

export const RoleModel = mongoose.model("roles", roleSchema);
