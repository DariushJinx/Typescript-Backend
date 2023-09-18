import createHttpError from "http-errors";
import { PermissionModel } from "../../../models/RBAC/permission/permission.model";
import { IPermission } from "../../../types/RBAC/permission/permission.types";

export class PermissionService {
  async findPermissionWithID(ID: string) {
    const permission = await PermissionModel.findById(ID);
    if (!permission) {
      throw createHttpError.NotFound("دسترسی مورد نظر یافت نشد");
    }
    return permission;
  }

  async findPermissionWithName(name: string): Promise<void> {
    const permission: IPermission | null = await PermissionModel.findOne({ name });
    if (permission) {
      throw createHttpError.BadRequest("دسترسی مورد نظر از قبل ایجاد شده است");
    }
  }

  async getAllPermission(): Promise<IPermission[]> {
    const permissions: IPermission[] = await PermissionModel.find({});
    return permissions;
  }
}
