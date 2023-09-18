import mongoose from "mongoose";
import { IPermission } from "../../../types/RBAC/permission/permission.types";

const permissionSchema = new mongoose.Schema<IPermission>(
  {
    name: { type: String, unique: true },
    description: { type: String, default: "" },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

export const PermissionModel = mongoose.model("permissions", permissionSchema);
