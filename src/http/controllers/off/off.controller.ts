import { Controller, Delete, Get, Middleware, Post } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { plainToClass } from "class-transformer";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import {
  CreateOffDto,
  GetOneOffCourseDto,
  GetOneOffProductDto,
  SetDiscountOnAllDto,
} from "../../dtos/off/off.dto";
import { OffModel } from "../../models/off/off.model";
import { ProductModel } from "../../models/product/product.model";
import { CourseModel } from "../../models/course/course.model";
import { IOff } from "../../types/off/off.types";
import mongoose from "mongoose";
import { AuthMiddleware } from "../../middlewares/authMiddleware";
import { OffService } from "../../services/off/off.service";

@Controller("off")
export class OffController {
  private offService: OffService = new OffService();
  @Post("add-product")
  @Middleware(AuthMiddleware)
  async createForProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const createOffDto: CreateOffDto = plainToClass(CreateOffDto, req.body, {
        excludeExtraneousValues: true,
      });
      const newOff: IOff | null = await this.offService.createForProduct(createOffDto, req);
      if (!newOff) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "تخفیف مورد نظر ایجاد نشد",
          },
        });
      }

      await ProductModel.findOneAndUpdate({ _id: newOff.product }, { discount: newOff.percent });
      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "تخفیف مورد نظر با موفقیت ایجاد شد",
          newOff,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Post("add-course")
  @Middleware(AuthMiddleware)
  async createForCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const createOffDto: CreateOffDto = plainToClass(CreateOffDto, req.body, {
        excludeExtraneousValues: true,
      });
      const newOff: IOff | null = await this.offService.createForCourse(createOffDto, req);
      if (!newOff) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "تخفیف مورد نظر ایجاد نشد",
          },
        });
      }
      await CourseModel.findOneAndUpdate({ _id: newOff.course }, { discount: newOff.percent });
      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "تخفیف مورد نظر با موفقیت ایجاد شد",
          newOff,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Get("list")
  @Middleware(AuthMiddleware)
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const list: IOff[] = await this.offService.getAll();
      if (list.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          statusCode: StatusCodes.NOT_FOUND,
          data: {
            message: "در حال حاظر تخفیفی وجود ندارد",
          },
        });
      }

      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "تمامی تخفیف های موجود با موفقیت بازگردانده شدند",
          list,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Post("get-one-product/:code")
  @Middleware(AuthMiddleware)
  async getOneForProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const getOneOffProductDto: GetOneOffProductDto = plainToClass(GetOneOffProductDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(getOneOffProductDto);
      const { code } = req.params;

      const { product } = getOneOffProductDto;
      const off: IOff | null = await OffModel.findOne({ code, product }).lean();
      if (!off) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "کد مورد نظر معتبر نمی باشد",
          },
        });
      } else if (off.max === off.uses) {
        return res.status(StatusCodes.CONFLICT).json({
          data: {
            message: "سقف استفاده از کد مورد نظر تمام شده است",
          },
        });
      } else {
        const Off = await OffModel.findOneAndUpdate({ code, product }, { uses: off.uses + 1 })
          .populate([
            {
              path: "product",
              select: {
                title: 1,
                short_title: 1,
                text: 1,
                short_text: 1,
                _id: 0,
              },
            },
          ])
          .lean();
        return res.status(StatusCodes.OK).json({
          data: {
            message: "سقف استفاده از کد تخفیف آپدیت شد",
            Off,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  @Post("get-one-course/:code")
  @Middleware(AuthMiddleware)
  async getOneForCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const getOneOffOfCourseDto: GetOneOffCourseDto = plainToClass(GetOneOffCourseDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(getOneOffOfCourseDto);
      const { code } = req.params;
      const { course } = getOneOffOfCourseDto;
      const off: IOff | null = await OffModel.findOne({ code, course }).lean();
      if (!off) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "کد مورد نظر معتبر نمی باشد",
          },
        });
      } else if (off.max === off.uses) {
        return res.status(StatusCodes.CONFLICT).json({
          data: {
            message: "سقف استفاده از کد مورد نظر تمام شده است",
          },
        });
      } else {
        const Off = await OffModel.findOneAndUpdate({ code, course }, { uses: off.uses + 1 })
          .populate([
            {
              path: "course",
              select: {
                title: 1,
                short_title: 1,
                text: 1,
                short_text: 1,
                _id: 0,
              },
            },
          ])
          .lean();
        return res.status(StatusCodes.OK).json({
          data: {
            message: "سقف استفاده از کد تخفیف آپدیت شد",
            Off,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  @Delete("remove/:id")
  @Middleware(AuthMiddleware)
  async removeOff(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      let deleteOff: any;
      if (mongoose.isValidObjectId(id)) {
        deleteOff = await OffModel.findOneAndRemove({ _id: id });
      }
      if (!deleteOff) {
        return res.status(StatusCodes.NOT_FOUND).json({
          statusCode: StatusCodes.NOT_FOUND,
          data: {
            message: "کد مورد نظر یافت نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "کد مورد نظر با موفقیت حذف شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Post("set-all")
  @Middleware(AuthMiddleware)
  async setOnAll(req: Request, res: Response, next: NextFunction) {
    try {
      const setDiscountOnAllDto: SetDiscountOnAllDto = plainToClass(SetDiscountOnAllDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(setDiscountOnAllDto);
      const { discount } = setDiscountOnAllDto;
      await ProductModel.updateMany({ discount });
      await CourseModel.updateMany({ discount });
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "کذ تخفیف برای تمامی محصولات اضافه گردید",
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
