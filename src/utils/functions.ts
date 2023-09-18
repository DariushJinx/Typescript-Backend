import JWT from "jsonwebtoken";
import { constants } from "./constans.utils";
import { JwtToken } from "../http/types/public/public.types";
import { compareSync } from "bcrypt";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import { CourseModel } from "../http/models/course/course.model";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserModel } from "../http/models/user/user.model";

export class FunctionUtils {
  public static RandomNumberGenerator(): number {
    return ~~(Math.random() * 90000 + 10000);
  }

  public static SignAccessToken(payload: JwtToken): string {
    const options = {
      expiresIn: "30d",
    };
    return JWT.sign(payload, constants.ACCESS_TOKEN_SECRET_KEY, options);
  }

  public static comparePassword(password: string, hashedPassword: string): boolean {
    return compareSync(password, hashedPassword);
  }

  public static ListOfImagesForRequest(files: Express.Multer.File[], fileUploadPath: string) {
    if (files) {
      return files
        .map((file) => path.join(`http://127.0.0.1:8888/`, fileUploadPath, file.filename))
        .map((item) => item.replace(/\\/g, "//"));
    } else {
      return [];
    }
  }

  public static deleteFileInPublic(fileAddress: string): void {
    if (fileAddress) {
      const pathFile = path.join(__dirname, "..", "..", "public", fileAddress);
      if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile);
    }
  }

  public static async findCourseById(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw createHttpError.BadRequest("شناسه ارسال شده صحیح نمیباشد");
    const course = await CourseModel.findById(id);
    if (!course) throw createHttpError.NotFound("دوره ای یافت نشد");
    return course;
  }

  public static copyObject(object: object) {
    return JSON.parse(JSON.stringify(object));
  }

  public static deleteInvalidPropertyInObject(
    data: { [key: string]: any } = {},
    blackList: string[] = []
  ) {
    const nullishData = ["", " ", "0", 0, null, undefined];
    Object.keys(data).forEach((key) => {
      if (blackList.includes(key)) delete data[key];
      if (typeof data[key] == "string") data[key] = data[key].trim();
      if (Array.isArray(data[key]) && data[key].length > 0)
        data[key] = data[key].map((item: any) => item.trim());
      if (Array.isArray(data[key]) && data[key].length == 0) delete data[key];
      if (nullishData.includes(data[key])) delete data[key];
    });
  }

  public static async findCourseWithTitleOrID(field: string, res: Response) {
    const findQuery = mongoose.isValidObjectId(field) ? { _id: field } : { title: field };
    const course = await CourseModel.findOne(findQuery);
    if (!course) {
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        data: {
          message: "دوره مورد نظر یافت نشد",
        },
      });
    }
    return course;
  }

  public static getTime(seconds: number) {
    let total: any = Math.round(seconds) / 60;
    let [minutes, percent] = String(total).split(".");
    let second: any = Math.round((+percent * 60) / 100)
      .toString()
      .substring(0, 2);
    let hour: any = 0;
    if (+minutes > 60) {
      total = +minutes / 60;
      let [h1, percent] = String(total).split(".");
      (hour = h1),
        (minutes = Math.round((+percent * 60) / 100)
          .toString()
          .substring(0, 2));
    }
    if (String(hour) == "1") hour = `0${hour}`;
    if (String(minutes) == "1") minutes = `0${minutes}`;
    if (String(second) == "1") second = `0${second}`;
    return `${hour} : ${minutes} : ${second}`;
  }

  public static async getBasketOfUser(userID: string, discount = {}) {
    const userDetail = await UserModel.aggregate([
      {
        $match: { _id: userID },
      },
      {
        $project: { basket: 1 },
      },
      {
        $lookup: {
          from: "products",
          localField: "basket.products.productID",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "basket.courses.courseID",
          foreignField: "_id",
          as: "courseDetail",
        },
      },

      {
        $addFields: {
          productDetail: {
            $function: {
              body: function (productDetail: { [key: string]: any }[], products: any) {
                if (Array.isArray(productDetail)) {
                  return productDetail.map(function (product) {
                    const count = products.find(
                      (item: any) => item.productID.valueOf() == product._id.valueOf()
                    ).count;
                    const totalPrice = count * product.price;
                    return {
                      ...product,
                      basketCount: count,
                      totalPrice,
                      finalPrice: totalPrice - (product.discount / 100) * totalPrice,
                    };
                  });
                }
              },
              args: ["$productDetail", "$basket.products"],
              lang: "js",
            },
          },
          courseDetail: {
            $function: {
              body: function (courseDetail: { [key: string]: any }[]) {
                return courseDetail.map(function (course) {
                  return {
                    ...course,
                    finalPrice: course.price - (course.discount / 100) * course.price,
                  };
                });
              },
              args: ["$courseDetail"],
              lang: "js",
            },
          },
          payDetail: {
            $function: {
              body: function (
                courseDetail: { [key: string]: any }[],
                productDetail: { [key: string]: any }[],
                products: any
              ) {
                const productAmount = productDetail.reduce(function (total, product) {
                  const count = products.find(
                    (item: any) => item.productID.valueOf() == product._id.valueOf()
                  ).count;
                  const totalPrice = count * product.price;
                  return total + (totalPrice - (product.discount / 100) * totalPrice);
                }, 0);

                const courseAmount = courseDetail.reduce(function (total, course) {
                  return total + (course.price - (course.discount / 100) * course.price);
                }, 0);

                const productIds = productDetail.map((product) => product._id.valueOf());
                const courseIds = courseDetail.map((course) => course._id.valueOf());
                return {
                  productAmount,
                  courseAmount,
                  paymentAmount: productAmount + courseAmount,
                  productIds,
                  courseIds,
                };
              },
              args: ["$courseDetail", "$productDetail", "$basket.products"],
              lang: "js",
            },
          },
        },
      },
      {
        $project: { basket: 0 },
      },
    ]);
    return FunctionUtils.copyObject(userDetail);
  }
}
