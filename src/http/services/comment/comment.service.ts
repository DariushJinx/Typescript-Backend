import { plainToClass } from "class-transformer";
import { CreateCommentDto } from "../../dtos/comment/comment.dto";
import { Request } from "express";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import { IUser } from "../../types/user/user.types";
import { IBlog } from "../../types/blog/blog.types";
import { BlogModel } from "../../models/blog/blog.model";
import { IComment } from "../../types/comment/comment.types";
import { CommentModel } from "../../models/comment/comment.model";
import { ICourse } from "../../types/course/course.types";
import { CourseModel } from "../../models/course/course.model";
import { IProduct } from "../../types/product/product.types";
import { ProductModel } from "../../models/product/product.model";

export class CommentService {
  async createComment(
    req: Request,
    comment: string,
    score: number,
    blogName?: string,
    courseName?: string,
    productName?: string
  ): Promise<any> {
    const user: IUser | undefined = req.user;
    if (blogName) {
      const blog: IBlog | null = await BlogModel.findOne({ title: blogName });

      const createCommentForBlog: IComment = await CommentModel.create({
        comment,
        blogName: blog?._id,
        commentUser: user?._id,
        score,
      });
      return createCommentForBlog;
    } else if (courseName) {
      const course: ICourse | null = await CourseModel.findOne({ title: courseName });

      const createCommentForCourse: IComment = await CommentModel.create({
        comment,
        courseName: course?._id,
        commentUser: user?._id,
        score,
      });
      return createCommentForCourse;
    } else if (productName) {
      const product: IProduct | null = await ProductModel.findOne({ title: productName });

      const createCommentForProduct: IComment = await CommentModel.create({
        comment,
        productName: product?._id,
        commentUser: user?._id,
        score,
      });
      return createCommentForProduct;
    }
  }

  async getAllComments(): Promise<IComment | null> {
    const comments: IComment | null = await CommentModel.find({})
      .populate([
        {
          path: "commentUser",
          select: { first_name: 1, last_name: 1, email: 1, role: 1, _id: 0 },
        },
        {
          path: "answers",
          populate: {
            path: "AnswerUser",
            select: {
              first_name: 1,
              last_name: 1,
              email: 1,
              role: 1,
              _id: 0,
            },
          },
        },

        {
          path: "productName",
          select: { title: 1, _id: 0 },
        },
        {
          path: "blogName",
          select: { title: 1, _id: 0 },
        },
        {
          path: "courseName",
          select: { title: 1, _id: 0 },
        },
      ])
      .lean();
    return comments;
  }
}
