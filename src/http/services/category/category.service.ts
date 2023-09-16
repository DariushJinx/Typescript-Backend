import { ICategory } from "../../types/category/category.types";
import { CategoryModel } from "../../models/category/category.model";
import mongoose from "mongoose";

export class CategoryService {

  async getAllCategories(): Promise<ICategory[]> {
    const categories = await CategoryModel.find({ parent: undefined })
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
    return categories;
  }
  
  async findCategoryWithTitleOrID(field: string): Promise<ICategory | null> {
    const findQuery = mongoose.isValidObjectId(field) ? { _id: field } : { title: field };
    const category = await CategoryModel.findOne(findQuery).lean();
    return category;
  }
}
