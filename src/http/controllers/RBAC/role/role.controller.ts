import { Controller, Delete, Get, Middleware, Post } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { plainToClass } from "class-transformer";
import { AuthMiddleware } from "../../../middlewares/authMiddleware";
import { CreateRoleDto } from "../../../dtos/RBAC/role/role.dto";
import { RoleService } from "../../../services/RBAC/role/role.service";
import { RoleModel } from "../../../models/RBAC/role/role.model";
import { IRole } from "../../../types/RBAC/role/role.types";
import { stringToArray } from "../../../middlewares/stringToArray";
import { checkPermission } from "../../../middlewares/permission.guard";
import { constants } from "../../../../utils/constans.utils";
import { isAdmin } from "../../../middlewares/isAdmin";

@Controller("role")
export class RoleController {
  private roleService: RoleService = new RoleService();

  @Post("add")
  @Middleware(AuthMiddleware)
  @Middleware(checkPermission([constants.PERMISSIONS.ALL]))
  @Middleware(stringToArray("permissions"))
  async createNewRole(req: Request, res: Response, next: NextFunction) {
    try {
      const createRoleDto: CreateRoleDto = plainToClass(CreateRoleDto, req.body, {
        excludeExtraneousValues: true,
      });
      const roles: IRole = await this.roleService.createNewRole(createRoleDto);
      if (!roles) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "نقش مورد نظر با موفقیت ایجاد نشد",
            roles,
          },
        });
      }
      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "نقش مورد نظر با موفقیت ایجاد شد",
          roles,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Get("list")
  @Middleware([AuthMiddleware,checkPermission([constants.PERMISSIONS.ADMIN])])
  async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles: IRole[] = await this.roleService.getAllRoles();
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "تمامی نقش های موجود بازگردانده شد",
          roles,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Delete("remove/:field")
  @Middleware(AuthMiddleware)
  @Middleware(checkPermission([constants.PERMISSIONS.ALL, constants.PERMISSIONS.ADMIN]))
  async removeRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { field } = req.params;
      const role = await this.roleService.findRoleWithTitleOrID(field);
      const removeResult = await RoleModel.deleteOne({ _id: role._id });
      if (!removeResult.deletedCount) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "حذف نقش با موفقیت انجام نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "حذف نقش با موفقیت انجام شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
