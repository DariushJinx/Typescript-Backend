import { NextFunction, Request, Response } from "express";
import { RoleModel } from "../models/RBAC/role/role.model";
import { PermissionModel } from "../models/RBAC/permission/permission.model";
import createHttpError from "http-errors";
import { IRole } from "../types/RBAC/role/role.types";
import { IPermission } from "../types/RBAC/permission/permission.types";

export function checkPermission(requiredPermissions: any[] = []) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const allPermissions = requiredPermissions.flat(2);
      let user = req.user;
      const role:IRole|null = await RoleModel.findOne({ title: user?.role });
      const permissions:IPermission[] = await PermissionModel.find({
        _id: { $in: role?.permissions },
      });
      const userPermissions = permissions.map((item: any) => item.name);
      const hasPermission = allPermissions.every((permission: any) => {
        return userPermissions.includes(permission);
      });
      console.log("hasPermission : ", hasPermission)
    //   if (userPermissions.includes(constants.PERMISSIONS.ALL)) return next();
      if (allPermissions.length == 0 || hasPermission) return next();
      throw createHttpError.Forbidden("شما به این قسمت دسترسی ندارید");
    } catch (error) {
      next(error);
    }
  };
}
