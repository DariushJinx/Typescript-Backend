import { Controller, Post, Middleware, Get, Delete, Patch } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { StatusCodes } from "http-status-codes";
import { AuthMiddleware } from "../../middlewares/authMiddleware";
import { FunctionUtils } from "../../../utils/functions";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import { BlogModel } from "../../models/blog/blog.model";
import { CommentModel } from "../../models/comment/comment.model";
import { CreateCommentDto } from "../../dtos/comment/comment.dto";
import { IBlog } from "../../types/blog/blog.types";
import { IUser } from "../../types/user/user.types";
import { CourseModel } from "../../models/course/course.model";
import { ICourse } from "../../types/course/course.types";
import { ProductModel } from "../../models/product/product.model";
import { IProduct } from "../../types/product/product.types";
import { IComment } from "../../types/comment/comment.types";
import { CommentService } from "../../services/comment/comment.service";

@Controller("comment")
export class CommentController {
  commentService: CommentService = new CommentService();
  @Post("add-comment-blog")
  @Middleware(AuthMiddleware)
  async createCommentForBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const createCommentDto: CreateCommentDto = plainToClass(CreateCommentDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(createCommentDto);
      const { comment, blogName, score } = createCommentDto;
      const createCommentForBlog: IComment = await this.commentService.createComment(
        req,
        comment,
        score,
        blogName
      );
      if (!createCommentForBlog) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "کامنت برای مقاله مورد نظر ایجاد نشد",
          },
        });
      }
      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "کامنت برای مقاله مورد نظر ایجاد شد",
          createCommentForBlog,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Post("add-comment-course")
  @Middleware(AuthMiddleware)
  async createCommentForCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const createCommentDto: CreateCommentDto = plainToClass(CreateCommentDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(createCommentDto);
      const { comment, courseName, score } = createCommentDto;

      const createCommentForCourse = await this.commentService.createComment(
        req,
        comment,
        score,
        courseName
      );
      if (!createCommentForCourse) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "کامنت برای دوره مورد نظر ایجاد نشد",
          },
        });
      }
      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "کامنت برای دوره مورد نظر ایجاد شد",
          createCommentForCourse,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Post("add-comment-product")
  @Middleware(AuthMiddleware)
  async createCommentForProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const createCommentDto: CreateCommentDto = plainToClass(CreateCommentDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(createCommentDto);
      const { comment, productName, score } = createCommentDto;

      const createCommentForProduct = await this.commentService.createComment(
        req,
        comment,
        score,
        productName
      );
      if (!createCommentForProduct) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "کامنت برای محصول مورد نظر ایجاد نشد",
            createCommentForProduct,
          },
        });
      }
      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "کامنت برای محصول مورد نظر ایجاد شد",
          createCommentForProduct,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Patch("answer/:id")
  @Middleware(AuthMiddleware)
  async createAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const createCommentDto: CreateCommentDto = plainToClass(CreateCommentDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(createCommentDto);
      const { comment } = createCommentDto;
      const user: IUser | undefined = req.user;
      const commentResult = await CommentModel.findOneAndUpdate(
        { _id: id },
        {
          $push: {
            answers: {
              comment,
              user: user?._id,
            },
          },
        }
      );
      if (!commentResult?.modifiedPaths) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "پاسخ کامنت مورد نظر با موفقیت ثبت نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "پاسخ کامنت مورد نظر با موفقیت ثبت شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Get("list")
  @Middleware(AuthMiddleware)
  async getAllComments(req: Request, res: Response, next: NextFunction) {
    try {
      const comments: IComment | null = await this.commentService.getAllComments();

      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "تمامی کامنت های موجود با موفقیت بازگردانده شدند",
          comments,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Patch("show/:id")
  @Middleware(AuthMiddleware)
  async showComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateResult = await CommentModel.updateOne({ _id: id }, { show: 1 });
      if (!updateResult.modifiedCount) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "حالت مشاهده کامنت فعال نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "حالت مشاهده کامنت فعال شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Delete("remove/:id")
  @Middleware(AuthMiddleware)
  async removeComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const removeResult = await CommentModel.findOneAndDelete({ _id: id });
      if (!removeResult?.modifiedPaths) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "کامنت مورد نظر با موفقیت حذف نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "کامنت مورد نظر با موفقیت حذف شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
