import { Controller, Middleware, Patch, Post } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { UserModel } from "../../models/user/user.model";
import { StatusCodes } from "http-status-codes";
import { plainToClass } from "class-transformer";
import { FunctionUtils } from "../../../utils/functions";
import { IUser } from "../../types/user/user.types";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import { BasketService } from "../../services/basket/basket.service";
import { AuthMiddleware } from "../../middlewares/authMiddleware";

@Controller("basket")
export class basketController {
  private basketService: BasketService = new BasketService();

  @Patch("add-product/:productID")
  @Middleware(AuthMiddleware)
  async addProductInBasket(req: Request, res: Response, next: NextFunction) {
    try {
      const { productID } = req.params;
      const user: IUser | undefined = req.user;
      await this.basketService.checkExistProduct(productID);
      const product: IUser = await this.basketService.findProductInBasket(user?._id, productID);
      let message: string;
      if (product) {
        await UserModel.updateOne(
          {
            _id: user?._id,
            "basket.products.productID": productID,
          },
          {
            $inc: {
              "basket.products.$.count": 1,
            },
          }
        );
        message = "یک عدد به محصول مورد نظر داخل سبد خرید شما اضافه شد";
      } else {
        await UserModel.updateOne(
          { _id: user?._id },
          {
            $push: {
              "basket.products": {
                productID,
                count: 1,
              },
            },
          }
        );
        message = "محصول مورد نظر با موفقیت به سبد خرید شما اضافه شد";
      }
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

  @Patch("remove-product/:productID")
  @Middleware(AuthMiddleware)
  async removeProductFromBasket(req: Request, res: Response, next: NextFunction) {
    try {
      const { productID } = req.params;
      const user: IUser | undefined = req.user;
      await this.basketService.checkExistProduct(productID);
      const product: IUser | null = await this.basketService.findProductInBasket(
        user?._id,
        productID
      );
      let message: string;
      if (product.count > "1") {
        await UserModel.updateOne(
          {
            _id: user?._id,
            "basket.products.productID": productID,
          },
          {
            $inc: {
              "basket.products.$.count": -1,
            },
          }
        );
        message = "یک عدد از محصول مورد نظر داخل سبد خرید شما کم شد";
      } else {
        await UserModel.updateOne(
          { _id: user?._id },
          {
            $pull: {
              "basket.products": {
                productID,
              },
            },
          }
        );
        message = "محصول مورد نظر از سبد خرید شما حذف شد";
      }
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

  @Patch("remove-all-product")
  @Middleware(AuthMiddleware)
  async removeAllProductFromBasket(req: Request, res: Response, next: NextFunction) {
    try {
      const user: IUser | undefined = req.user;

      await UserModel.updateOne(
        { _id: user?._id },
        {
          $pull: {
            "basket.products": {},
          },
        }
      );

      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "تمامی محصولات از سبد خرید شما پاک شدند",
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Patch("add-course/:courseID")
  @Middleware(AuthMiddleware)
  async addCourseInBasket(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseID } = req.params;
      const user: IUser | undefined = req.user;
      await this.basketService.checkExistCourse(courseID);
      const course: IUser | null = await this.basketService.findCourseInBasket(user?._id, courseID);
      if (course) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          statusCode: StatusCodes.BAD_REQUEST,
          data: {
            message: "این دوره قبلا به سبد خرید شما اضافه شده است",
          },
        });
      } else {
        await UserModel.updateOne(
          { _id: user?._id },
          {
            $push: {
              "basket.courses": {
                courseID,
                count: 1,
              },
            },
          }
        );
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "دوره مورد نظر با موفقیت به سبد خرید شما اضافه شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Patch("remove-course/:courseID")
  @Middleware(AuthMiddleware)
  async removeCourseFromBasket(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseID } = req.params;
      const user: IUser | undefined = req.user;
      await this.basketService.checkExistCourse(courseID);
      const course: IUser | null = await this.basketService.findCourseInBasket(user?._id, courseID);
      if (!course) {
        return res.status(StatusCodes.NOT_FOUND).json({
          statusCode: StatusCodes.NOT_FOUND,
          data: {
            message: "دوره مورد نظر در سبد خرید شما یافت نشد",
          },
        });
      }
      await UserModel.updateOne(
        { _id: user?._id },
        {
          $pull: {
            "basket.courses": {
              courseID,
            },
          },
        }
      );

      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "دوره مورد نظر از سبد خرید شما حذف شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
