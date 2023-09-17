import mongoose from "mongoose";
import { BlogModel } from "../../models/blog/blog.model";
import { IBlog } from "../../types/blog/blog.types";
import createHttpError from "http-errors";

export class BlogService {
  async findBlogWithTitleOrID(field: string): Promise<IBlog> {
    const findQuery = mongoose.isValidObjectId(field) ? { _id: field } : { title: field };
    const blog: IBlog | null = await BlogModel.findOne(findQuery);
    if (blog) return blog;
    else throw createHttpError.NotFound("مقاله مورد نظر یافت نشد");
  }
}
