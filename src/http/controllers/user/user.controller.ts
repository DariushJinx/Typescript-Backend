import { Controller, Delete, Get, Middleware, Patch, Post } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { plainToClass } from "class-transformer";
import { UserModel } from "../../models/user/user.model";
import { IUser } from "../../types/user/user.types";
import { BanUserDto, ChangeRoleDto } from "../../dtos/user/user.dto";
import { BanModel } from "../../models/ban/ban.model";
import { IBanUser } from "../../types/ban/ban.types";
import { UserService } from "../../services/user/user.service";
import { AuthMiddleware } from "../../middlewares/authMiddleware";

@Controller("user")
export class UserController {
  private userService: UserService = new UserService();

  @Get("list")
  @Middleware(AuthMiddleware)
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const users: IUser[] = await UserModel.find(
          {},
          { expiresIn: 0, password: 0, __v: 0 }
        ).lean();
        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "تمامی کاربران موجود با موفقیت بازگردانده شدند",
            users,
          },
        });
      
    } catch (err) {
      next(err);
    }
  }

  @Patch("update-role")
  @Middleware(AuthMiddleware)
  async changeRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const changeRoleDto: ChangeRoleDto = plainToClass(ChangeRoleDto, req.body, {
        excludeExtraneousValues: true,
      });
      const message: string = await this.userService.changeRoles(changeRoleDto);
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Post("ban/:id")
  @Middleware(AuthMiddleware)
  async banUser(req: Request, res: Response, next: NextFunction) {
    try {
      const banUserDto: BanUserDto = plainToClass(BanUserDto, req.params, {
        excludeExtraneousValues: true,
      });
      const mainUser: IUser|null = await this.userService.banUser(banUserDto);
      const banUserResult: IBanUser = await BanModel.create({ mobile: mainUser?.mobile });
      if (!banUserResult) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "بن شدن کاربر انجام نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "کاربر مورد نظر با موفقیت بن شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
