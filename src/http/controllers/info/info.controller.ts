import { Controller, Get, Middleware } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CourseUserModel } from "../../models/courseUser/courseUser.model";
import { CourseModel } from "../../models/course/course.model";
import { ProductModel } from "../../models/product/product.model";
import { BlogModel } from "../../models/blog/blog.model";
import { UserModel } from "../../models/user/user.model";
import { IUser } from "../../types/user/user.types";
import { AuthMiddleware } from "../../middlewares/authMiddleware";

@Controller("info")
export class InfoController {
  @Get("p-admin")
  @Middleware(AuthMiddleware)
  async getPAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const user: IUser | undefined = req.user;
      const coursesRegistersCount: number = await CourseUserModel.find({}).lean().count();
      const coursesCount: number = await CourseModel.find({}).lean().count();
      const productsCount: number = await ProductModel.find({}).lean().count();
      const blogsCount: number = await BlogModel.find({}).lean().count();
      const episodesCount: number = await CourseModel.find({})
        .populate([{ path: "chapters", populate: { path: "episodes" } }])
        .lean()
        .count();
      let users: IUser[] = await UserModel.find().sort({ _id: -1 }).lean();

      const admin: IUser | null = await UserModel.findOne({ _id: user?._id });
      users = users.slice(0, 5);

      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          infos: [
            {
              count: coursesRegistersCount,
              title: "ثبت نامی‌ها",
            },
            {
              count: coursesCount,
              title: "دوره‌ها",
            },
            {
              count: episodesCount,
              title: "جلسات",
            },
            {
              count: productsCount,
              title: "محصولات",
            },
            {
              count: blogsCount,
              title: "مقالات",
            },
          ],
          lastUsers: users,
          adminName: admin?.first_name,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Get("admins")
  @Middleware(AuthMiddleware)
  async admins(req: Request, res: Response, next: NextFunction) {
    try {
      const AllAdmin: IUser[] = await UserModel.find({
        $or: [{ role: "ADMIN" }, { role: "ALL" }],
      }).lean();

      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "تمامی ادمین های موجود بازگردانی شدند",
          AllAdmin,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
