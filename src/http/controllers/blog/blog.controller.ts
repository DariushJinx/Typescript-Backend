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

@Controller("blog")
export class BlogController {
  private blogService: BlogService = new BlogService();

  @Post("add")
  @Middleware(AuthMiddleware)
  @Middleware(Upload.uploadFile.array("images", 10))
  @Middleware(stringToArray("tags"))
  async createBlog (req: Request, res: Response, next: NextFunction) {
    try {
        const createBlogDto: CreateBlogDto = plainToClass(CreateBlogDto, req.body, {
            excludeExtraneousValues: true,
          });
          errorHandler(createBlogDto);
          const files = req.files as { [filename: string]: Express.Multer.File[] };
          if (Array.isArray(files)) {
              const images = FunctionUtils.ListOfImagesForRequest(files || [], req.body.fileUploadPath);
              const { title, text, short_text, tags, category } = createBlogDto;
              const author = req?.user?._id;
              const blog = await BlogModel.create({
                title,
                text,
                short_text,
                tags,
                category,
                author,
                images,
              });
          
              if(!blog){
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
  };
  
  @Get("list")
  async getAllBlogs (req: Request, res: Response, next: NextFunction) {
    try {
      const blogs = await BlogModel.find({})
        .populate([
          {
            path: "author",
            select: {
              first_name: 1,
              last_name: 1,
              username: 1,
              role: 1,
              _id: 0,
            },
          },
          {
            path: "category",
            select: { title: 1, _id: 0 },
          },
          {
            path: "likes",
            select: {
              first_name: 1,
              last_name: 1,
              username: 1,
              role: 1,
              _id: 0,
            },
          },
          {
            path: "dislikes",
            select: {
              first_name: 1,
              last_name: 1,
              username: 1,
              role: 1,
              _id: 0,
            },
          },
          {
            path: "bookmarks",
            select: {
              first_name: 1,
              last_name: 1,
              username: 1,
              role: 1,
              _id: 0,
            },
          },
        ])
        .lean()
        .sort({ _id: -1 });
  
      const comments = await CommentModel.find({ show: 1 })
        .populate([
          { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
        ])
        .lean();
  
      let allBlogs:object[] = [];
      blogs.forEach((blog) => {
        let blogTotalScore = 5;
  
        let blogScores = comments.filter((comment) => {
          if (comment.blogName) {
            if (comment.blogName.toString() === blog._id.toString()) {
              return comment;
            }
          }
        });
  
        let blogComments = comments.filter((comment) => {
          if (comment.blogName) {
            if (comment.blogName.toString() === blog._id.toString()) {
              return comment;
            }
          }
        });
  
        blogScores.forEach((comment) => {
          blogTotalScore += Number(comment.score);
        });
  
        allBlogs.push({
          ...blog,
          blogComments,
          blogAverageScore: Math.floor(blogTotalScore / (blogScores.length + 1)),
        });
      });
  
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
  };
  
  @Get("get-one/:id")
  async getOneBlog (req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const findBlog = await this.blogService.findBlogWithTitleOrID(id);
      const blog = await BlogModel.findOne({ _id: findBlog._id })
        .populate([
          {
            path: "author",
            select: {
              first_name: 1,
              last_name: 1,
              username: 1,
              role: 1,
              _id: 0,
            },
          },
          {
            path: "category",
            select: { title: 1, _id: 0 },
          },
          {
            path: "likes",
            select: {
              first_name: 1,
              last_name: 1,
              username: 1,
              role: 1,
              _id: 0,
            },
          },
          {
            path: "dislikes",
            select: {
              first_name: 1,
              last_name: 1,
              username: 1,
              role: 1,
              _id: 0,
            },
          },
          {
            path: "bookmarks",
            select: {
              first_name: 1,
              last_name: 1,
              username: 1,
              role: 1,
              _id: 0,
            },
          },
        ])
        .lean();
  
      const comments = await CommentModel.find({ blogName: blog?._id, show: 1 })
        .populate([
          { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
        ])
        .lean();
  
      let blogTotalScore = 5;
  
      let blogScores = comments.filter((comment) => {
        if (comment.blogName) {
          if (comment.blogName.toString() === blog?._id.toString()) {
            return comment;
          }
        }
      });
  
      blogScores.forEach((comment) => {
        blogTotalScore += Number(comment.score);
      });
  
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "مقاله مورد نظر با موفقیت بازگردانده شد",
          ...blog,
          comments,
          blogAverageScore: Math.floor(blogTotalScore / (blogScores.length + 1)),
        },
      });
    } catch (err) {
      next(err);
    }
  };
  
  @Get("search")
  async getBlogWithSearch (req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req?.query;
      if (typeof search == "string" && search) {
        const blogSearch = await BlogModel.findOne({ $text: { $search: search } })
          .populate([
            {
              path: "author",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
            {
              path: "category",
              select: { title: 1 },
            },
            {
              path: "likes",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
            {
              path: "dislikes",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
            {
              path: "bookmarks",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
          ])
          .lean();
  
        const comments = await CommentModel.find({ blogName: blogSearch?._id, show: 1 })
          .populate([
            { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
          ])
          .lean();
  
        let blogTotalScore = 5;
  
        let blogScores = comments.filter((comment) => {
          if (comment.blogName) {
            if (comment.blogName.toString() === blogSearch?._id.toString()) {
              return comment;
            }
          }
        });
  
        blogScores.forEach((comment) => {
          blogTotalScore += Number(comment.score);
        });
  
        if(!blogSearch){
          return res.status(StatusCodes.NOT_FOUND).json({
            statusCode: StatusCodes.NOT_FOUND,
            data: {
              message: "مقاله مورد نظر یافت نشد",
            },
          });
        }
        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "مقاله مورد نظر با موفقیت بازگردانی شد",
            ...blogSearch,
            comments,
            blogAverageScore: Math.floor(blogTotalScore / (blogScores.length + 1)),
          },
        });
      } else {
        const blogSearches = await BlogModel.find({})
          .populate([
            {
              path: "author",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
            {
              path: "category",
              select: { title: 1 },
            },
            {
              path: "likes",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
            {
              path: "dislikes",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
            {
              path: "bookmarks",
              select: { first_name: 1, last_name: 1, username: 1, role: 1 },
            },
          ])
          .lean();
  
        const comments = await CommentModel.find({ show: 1 })
          .populate([
            { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
          ])
          .lean();
  
        let allBlogs:object[] = [];
        blogSearches.forEach((blog) => {
          let blogTotalScore = 5;
  
          let blogScores = comments.filter((comment) => {
            if (comment.blogName) {
              if (comment.blogName.toString() === blog._id.toString()) {
                return comment;
              }
            }
          });
  
          let blogComments = comments.filter((comment) => {
            if (comment.blogName) {
              if (comment.blogName.toString() === blog._id.toString()) {
                return comment;
              }
            }
          });
  
          blogScores.forEach((comment) => {
            blogTotalScore += Number(comment.score);
          });
  
          allBlogs.push({
            ...blog,
            blogComments,
            blogAverageScore: Math.floor(blogTotalScore / (blogScores.length + 1)),
          });
        });
  
        if(!blogSearches){
          return res.status(StatusCodes.NOT_FOUND).json({
            statusCode: StatusCodes.NOT_FOUND,
            data: {
              message: "مقاله مورد نظر یافت نشد",
            },
          });
        }
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
  };
  
  @Delete("remove/:id")
  @Middleware(AuthMiddleware)
  async removeBlog (req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blog = await this.blogService.findBlogWithTitleOrID(id);
      const removeResult = await BlogModel.deleteOne({ _id: blog._id });
      if(!removeResult.deletedCount){
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
  };
  
  @Patch("update/:id")
  @Middleware(AuthMiddleware)
  @Middleware(Upload.uploadFile.array("images", 10))
  @Middleware(stringToArray("tags"))
  async updateBlog (req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blog = await this.blogService.findBlogWithTitleOrID(id);
      const files = req.files as { [filename: string]: Express.Multer.File[] };
      let blackListFields = ["likes", "dislikes", "bookmarks", "comments", "author"];
      const data = FunctionUtils.copyObject(req.body);
      FunctionUtils.deleteInvalidPropertyInObject(data, blackListFields);
      if (Array.isArray(files)) {
          if (req?.body?.fileUploadPath && req?.files) {
            FunctionUtils.ListOfImagesForRequest(files || [], req.body.fileUploadPath);
          } 
          const updateResult = await BlogModel.updateOne({ _id: blog?._id }, { $set: data });
          if(!updateResult.modifiedCount){
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
  };
  
  @Get("bookmark/:blogID")
  @Middleware(AuthMiddleware)
  async bookmarkedBlogWithBlogID (req: Request, res: Response, next: NextFunction) {
    try {
      const { blogID } = req.params;
      await this.blogService.findBlogWithTitleOrID(blogID);
      const user = req.user;
      const bookmarkedBlog = await BlogModel.findOne({
        _id: blogID,
        bookmarks: user?._id,
      });
      const updateQuery = bookmarkedBlog
        ? { $pull: { bookmarks: user?._id } }
        : { $push: { bookmarks: user?._id } };
      await BlogModel.updateOne({ _id: blogID }, updateQuery);
      let message;
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
  };
  
  @Get("like/:blogID")
  @Middleware(AuthMiddleware)
  async likedBlog (req: Request, res: Response, next: NextFunction) {
    try {
      const { blogID } = req.params;
      await this.blogService.findBlogWithTitleOrID(blogID);
      const user = req.user;
      const likedBlog = await BlogModel.findOne({
        _id: blogID,
        likes: user?._id,
      });
      const dislikedBlog = await BlogModel.findOne({
        _id: blogID,
        dislikes: user?._id,
      });
      const updateQueryForLikes = likedBlog
        ? { $pull: { likes: user?._id } }
        : { $push: { likes: user?._id } };
      const updateQueryForDislikes = dislikedBlog && {
        $pull: { dislikes: user?._id },
      };
      await BlogModel.updateOne({ _id: blogID }, updateQueryForLikes);
      let message;
      if (!likedBlog) {
        if(updateQueryForDislikes){
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
  };
  
  @Get("dislike/:blogID")
  @Middleware(AuthMiddleware)
  async dislikedBlog (req: Request, res: Response, next: NextFunction) {
    try {
      const { blogID } = req.params;
      await this.blogService.findBlogWithTitleOrID(blogID);
      const user = req.user;
      const likesBlog = await BlogModel.findOne({
        _id: blogID,
        likes: user?._id,
      });
      const dislikesBlog = await BlogModel.findOne({
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
        if(updateQueryForLikes){
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
  };
}
