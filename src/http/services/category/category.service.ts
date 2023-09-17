import { ICategory } from "../../types/category/category.types";
import { CategoryModel } from "../../models/category/category.model";
import mongoose from "mongoose";
import createHttpError from "http-errors";

export class CategoryService {
  async getAllCategories(): Promise<ICategory[]> {
    const categories: ICategory[] = await CategoryModel.find({ parent: undefined })
      .populate([
        {
          path: "children",
          select: { parent: 1, title: 1 },
          populate: {
            path: "children",
          },
        },
      ])
      .lean();
    if (categories) return categories;
    else throw createHttpError.NotFound("دسته بندی ایی یافت نشد");
  }

  async findCategoryWithTitleOrID(field: string): Promise<ICategory | null> {
    const findQuery:
      | {
          _id: string;
          title?: undefined;
        }
      | {
          title: string;
          _id?: undefined;
        } = mongoose.isValidObjectId(field) ? { _id: field } : { title: field };
    const category: ICategory | null = await CategoryModel.findOne(findQuery).lean();
    return category;
  }
}
