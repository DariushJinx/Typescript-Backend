import { Controller, Delete, Get, Middleware, Post } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { plainToClass } from "class-transformer";
import { errorHandler } from "../../../../utils/ApiErrorHandler";
import { AuthMiddleware } from "../../../middlewares/authMiddleware";
import { CreatePermissionDto } from "../../../dtos/RBAC/permission/permission.dto";
import { PermissionService } from "../../../services/RBAC/permission/permission.service";
import { PermissionModel } from "../../../models/RBAC/permission/permission.model";
import { IPermission } from "../../../types/RBAC/permission/permission.types";

@Controller("permission")
export class PermissionController {
  private permissionService: PermissionService = new PermissionService();

  @Post("add")
  @Middleware(AuthMiddleware)
  async createNewPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const createPermissionDto: CreatePermissionDto = plainToClass(CreatePermissionDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(createPermissionDto);
      const { name, description } = createPermissionDto;
      await this.permissionService.findPermissionWithName(name);
      const permissions: IPermission = await PermissionModel.create({ name, description });
      if (!permissions) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "دسترسی مورد نظر ایجاد نشد",
          },
        });
      }
      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "دسترسی مورد نظر ایجاد شد",
          permissions,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Get("list")
  @Middleware(AuthMiddleware)
  async getAllPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const permissions: IPermission[] = await this.permissionService.getAllPermission();
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "تمامی دسترسی های موجود بازگردانده شدند",
          permissions,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Delete("remove/:id")
  @Middleware(AuthMiddleware)
  async removePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.permissionService.findPermissionWithID(id);
      const removeResult = await PermissionModel.deleteOne({ _id: id });
      if (!removeResult.deletedCount) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "دسترسی مورد نظر حذف نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "دسترسی مورد نظر با موفقیت حذف شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
