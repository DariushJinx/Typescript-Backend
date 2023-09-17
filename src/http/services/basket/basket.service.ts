import createHttpError from "http-errors";
import { FunctionUtils } from "../../../utils/functions";
import { UserModel } from "../../models/user/user.model";
import { IUser } from "../../types/user/user.types";
import { ProductModel } from "../../models/product/product.model";
import { IProduct } from "../../types/product/product.types";
import { CourseModel } from "../../models/course/course.model";
import { ICourse } from "../../types/course/course.types";

export class BasketService {
  async findProductInBasket(userID: string, productID: string): Promise<IUser> {
    const findResult: IUser | null = await UserModel.findOne(
      { _id: userID, "basket.products.productID": productID },
      { "basket.products.$": 1 }
    );
    let userDetail;
    if (findResult) {
      userDetail = FunctionUtils.copyObject(findResult);
    }

    return userDetail?.basket?.products?.[0];
  }

  async findCourseInBasket(userID: string, courseID: string): Promise<IUser> {
    const findResult: IUser | null = await UserModel.findOne(
      { _id: userID, "basket.courses.courseID": courseID },
      { "basket.courses.$": 1 }
    );
    let userDetail;
    if (findResult) {
      userDetail = FunctionUtils.copyObject(findResult);
    }
    return userDetail?.basket?.courses?.[0];
  }

  async checkExistProduct(id: string): Promise<IProduct> {
    const product = await ProductModel.findById(id);
    if (!product) throw createHttpError.NotFound("محصول مورد نظر یافت نشد");
    return product;
  }

  async checkExistCourse(id: string): Promise<ICourse> {
    const course = await CourseModel.findById(id);
    if (!course) throw createHttpError.NotFound("دوره مورد نظر یافت نشد");
    return course;
  }
}
