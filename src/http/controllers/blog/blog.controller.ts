import { Controller, Delete, Get, Middleware, Patch, Post } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { plainToClass } from "class-transformer";
import { FunctionUtils } from "../../../utils/functions";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import { AuthMiddleware } from "../../middlewares/authMiddleware";
import { Upload } from "../../../utils/multer";
import { stringToArray } from "../../middlewares/stringToArray";
import { CreateBlogDto } from "../../dtos/blog/blog.dto";
import { BlogModel } from "../../models/blog/blog.model";
import { BlogService } from "../../services/blog/blog.service";
import { CommentModel } from "../../models/comment/comment.model";
import { IBlog } from "../../types/blog/blog.types";
import { IComment } from "../../types/comment/comment.types";
import { IUser } from "../../types/user/user.types";

@Controller("blog")
export class BlogController {
  private blogService: BlogService = new BlogService();

  @Post("add")
  @Middleware(AuthMiddleware)
  @Middleware(Upload.uploadFile.array("images", 10))
  @Middleware(stringToArray("tags"))
  async createBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const createBlogDto: CreateBlogDto = plainToClass(CreateBlogDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(createBlogDto);
      const files: {
        [filename: string]: Express.Multer.File[];
      } = req.files as { [filename: string]: Express.Multer.File[] };
      if (Array.isArray(files)) {
        const images: string[] = FunctionUtils.ListOfImagesForRequest(
          files || [],
          req.body.fileUploadPath
        );
        const { title, text, short_text, tags, category } = createBlogDto;
        const author = req?.user?._id;
        const blog: IBlog | null = await BlogModel.create({
          title,
          text,
          short_text,
          tags,
          category,
          author,
          images,
        });

        if (!blog) {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
              message: "مقاله مورد نظر با موفقیت ایجاد نشد",
            },
          });
        }

        return res.status(StatusCodes.CREATED).json({
          statusCode: StatusCodes.CREATED,
          data: {
            message: "مقاله مورد نظر با موفقیت ایجاد شد",
            blog,
          },
        });
      }
    } catch (err) {
      FunctionUtils.deleteFileInPublic(req.body.images);
      next(err);
    }
  }

  @Get("list")
  async getAllBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const allBlogs: object[] = await this.blogService.allBlogs();

      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "تمامی مقاله های موجود با موفقیت بازگردانده شدند",
          allBlogs,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Get("get-one/:id")
  async getOneBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: any = await this.blogService.getOneBlog(id);

      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  @Get("search")
  async getBlogWithSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req?.query;
      if (typeof search == "string" && search) {
        const data: any = await this.blogService.getOneBlog(search);
        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data,
        });
      } else {
        const allBlogs: object[] = await this.blogService.allBlogs();
        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "مقاله مورد نظر با موفقیت بازگردانی شد",
            allBlogs,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  @Delete("remove/:id")
  @Middleware(AuthMiddleware)
  async removeBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blog: IBlog | null = await this.blogService.findBlogWithTitleOrID(id);
      const removeResult = await BlogModel.deleteOne({ _id: blog._id });
      if (!removeResult.deletedCount) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "مقاله مورد نظر با موفقیت حذف نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "مقاله مورد نظر با موفقیت حذف شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Patch("update/:id")
  @Middleware(AuthMiddleware)
  @Middleware(Upload.uploadFile.array("images", 10))
  @Middleware(stringToArray("tags"))
  async updateBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blog: IBlog | null = await this.blogService.findBlogWithTitleOrID(id);
      const files: {
        [filename: string]: Express.Multer.File[];
      } = req.files as { [filename: string]: Express.Multer.File[] };
      let blackListFields: string[] = ["likes", "dislikes", "bookmarks", "comments", "author"];
      const data: any = FunctionUtils.copyObject(req.body);
      FunctionUtils.deleteInvalidPropertyInObject(data, blackListFields);
      if (Array.isArray(files)) {
        if (req?.body?.fileUploadPath && req?.files) {
          FunctionUtils.ListOfImagesForRequest(files || [], req.body.fileUploadPath);
        }
        const updateResult = await BlogModel.updateOne({ _id: blog?._id }, { $set: data });
        if (!updateResult.modifiedCount) {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
              message: "مقاله مورد نظر با موفقیت به روزرسانی نشد",
            },
          });
        }
        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "مقاله مورد نظر با موفقیت به روزرسانی شد",
          },
        });
      }
    } catch (err) {
      FunctionUtils.deleteFileInPublic(req.body.images);
      next(err);
    }
  }

  @Get("bookmark/:blogID")
  @Middleware(AuthMiddleware)
  async bookmarkedBlogWithBlogID(req: Request, res: Response, next: NextFunction) {
    try {
      const { blogID } = req.params;
      await this.blogService.findBlogWithTitleOrID(blogID);
      const user: IUser | undefined = req.user;
      const bookmarkedBlog: IBlog | null = await BlogModel.findOne({
        _id: blogID,
        bookmarks: user?._id,
      });
      const updateQuery = bookmarkedBlog
        ? { $pull: { bookmarks: user?._id } }
        : { $push: { bookmarks: user?._id } };
      await BlogModel.updateOne({ _id: blogID }, updateQuery);
      let message: string;
      if (!bookmarkedBlog) message = "مقاله مورد نظر به لیست علاقه مندی های شما اضافه شد";
      else message = "مقاله مورد نظر از لیست علاقه مندی های شما حذف شد";
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

  @Get("like/:blogID")
  @Middleware(AuthMiddleware)
  async likedBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { blogID } = req.params;
      await this.blogService.findBlogWithTitleOrID(blogID);
      const user: IUser | undefined = req.user;
      const likedBlog: IBlog | null = await BlogModel.findOne({
        _id: blogID,
        likes: user?._id,
      });
      const dislikedBlog: IBlog | null = await BlogModel.findOne({
        _id: blogID,
        dislikes: user?._id,
      });
      const updateQueryForLikes:
        | {
            $pull: {
              likes: any;
            };
            $push?: undefined;
          }
        | {
            $push: {
              likes: any;
            };
            $pull?: undefined;
          } = likedBlog ? { $pull: { likes: user?._id } } : { $push: { likes: user?._id } };
      const updateQueryForDislikes: {
        $pull: {
          dislikes: any;
        };
      } | null = dislikedBlog && {
        $pull: { dislikes: user?._id },
      };
      await BlogModel.updateOne({ _id: blogID }, updateQueryForLikes);
      let message: string;
      if (!likedBlog) {
        if (updateQueryForDislikes) {
          if (dislikedBlog) await BlogModel.updateOne({ _id: blogID }, updateQueryForDislikes);
        }
        message = "پسندیدن مقاله با موفقیت انجام شد";
      } else message = "پسندیدن مقاله با موفقیت لغو شد";
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

  @Get("dislike/:blogID")
  @Middleware(AuthMiddleware)
  async dislikedBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { blogID } = req.params;
      await this.blogService.findBlogWithTitleOrID(blogID);
      const user: IUser | undefined = req.user;
      const likesBlog = await BlogModel.findOne({
        _id: blogID,
        likes: user?._id,
      });
      const dislikesBlog: IBlog | null = await BlogModel.findOne({
        _id: blogID,
        dislikes: user?._id,
      });
      const updateQueryForDislikes = dislikesBlog
        ? { $pull: { dislikes: user?._id } }
        : { $push: { dislikes: user?._id } };
      const updateQueryForLikes = likesBlog && {
        $pull: { likes: user?._id },
      };
      await BlogModel.updateOne({ _id: blogID }, updateQueryForDislikes);
      let message;
      if (!dislikesBlog) {
        if (updateQueryForLikes) {
          if (likesBlog) await BlogModel.updateOne({ _id: blogID }, updateQueryForLikes);
        }
        message = "نپسندیدن مقاله با موفقیت انجام شد";
      } else message = "نپسندیدن مقاله با موفقیت لغو شد";
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
}
