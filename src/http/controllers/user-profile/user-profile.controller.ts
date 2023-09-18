import { Controller, Get, Middleware, Patch } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { FunctionUtils } from "../../../utils/functions";
import { UserModel } from "../../models/user/user.model";
import { AuthMiddleware } from "../../middlewares/authMiddleware";
import { IUser } from "../../types/user/user.types";
import { UserProfileService } from "../../services/user-profile/user-profile.service";
import { IBlog } from "../../types/blog/blog.types";
import { ICourse } from "../../types/course/course.types";

@Controller("profile")
export class UserProfile {
  private userProfileService: UserProfileService = new UserProfileService();
  @Get("bookmark-blog")
  @Middleware(AuthMiddleware)
  async getUserBookmarkedBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const user: IUser | undefined = req.user;
      if (user) {
        const blogs: IBlog[] = await this.userProfileService.getUserBookmarkedBlogs(user);
        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "لیست ذخیره شده ها با موفقیت بازگردانده شد",
            blogs,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  @Get("bookmark-product")
  @Middleware(AuthMiddleware)
  async getUserBookmarkedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (user) {
        const products = await this.userProfileService.getUserBookmarkedProducts(user);
        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "لیست ذخیره شده ها با موفقیت بازگردانده شد",
            products,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  @Get("bookmark-course")
  @Middleware(AuthMiddleware)
  async getUserBookmarkedCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (user) {
        const courses: ICourse[] = await this.userProfileService.getUserBookmarkedCourses(user);
        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "لیست ذخیره شده ها با موفقیت بازگردانده شد",
            courses,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  @Get("basket")
  @Middleware(AuthMiddleware)
  async getUserBasket(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const userDetail = await FunctionUtils.getBasketOfUser(user?._id);
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "سبد خرید شما با موفقیت بازگردانی شد",
          userDetail,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Patch("update-profile")
  @Middleware(AuthMiddleware)
  async updateUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userID = req?.user?._id;
      const data = req.body;
      const BlackListFields:string[] = ["mobile", "otp", "bills", "discount", "role", "Courses"];
      FunctionUtils.deleteInvalidPropertyInObject(data, BlackListFields);
      const updateResult = await UserModel.updateOne({ _id: userID }, { $set: data });
      if (!updateResult.modifiedCount) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "کاربر مورد نظر با موفقیت به روزرسانی نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "کاربر مورد نظر با موفقیت به روزرسانی شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
