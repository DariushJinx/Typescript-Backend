import mongoose from "mongoose";
import { BlogModel } from "../../models/blog/blog.model";
import { IBlog } from "../../types/blog/blog.types";
import createHttpError from "http-errors";
import { IComment } from "../../types/comment/comment.types";
import { CommentModel } from "../../models/comment/comment.model";

export class BlogService {
  async findBlogWithTitleOrID(field: string): Promise<IBlog> {
    const findQuery:
      | {
          _id: string;
          title?: undefined;
        }
      | {
          title: string;
          _id?: undefined;
        } = mongoose.isValidObjectId(field) ? { _id: field } : { title: field };
    const blog: IBlog | null = await BlogModel.findOne(findQuery);
    if (blog) return blog;
    else throw createHttpError.NotFound("مقاله مورد نظر یافت نشد");
  }

  async allBlogs(): Promise<object[]> {
    const blogs: IBlog[] = await BlogModel.find({})
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

    const comments: IComment[] = await CommentModel.find({ show: 1 })
      .populate([
        { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
      ])
      .lean();

    let allBlogs: object[] = [];
    blogs.forEach((blog) => {
      let blogTotalScore: number = 5;

      let blogScores: IComment[] = comments?.filter((comment) => {
        if (comment.blogName) {
          if (comment.blogName.toString() === blog._id.toString()) {
            return comment;
          }
        }
      });

      let blogComments: IComment[] = comments?.filter((comment) => {
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
    return allBlogs;
  }

  async getOneBlog(id?: string, search?: string): Promise<any> {
    if (id) {
      const findBlog: IBlog | null = await this.findBlogWithTitleOrID(id);
      const blog: IBlog | null = await BlogModel.findOne({ _id: findBlog._id })
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

      const comments: IComment[] = await CommentModel.find({ blogName: blog?._id, show: 1 })
        .populate([
          { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
        ])
        .lean();

      let blogTotalScore: number = 5;

      let blogScores: IComment[] = comments?.filter((comment) => {
        if (comment.blogName) {
          if (comment.blogName.toString() === blog?._id.toString()) {
            return comment;
          }
        }
      });

      blogScores.forEach((comment) => {
        blogTotalScore += Number(comment.score);
      });

      const data = {
        message: "مقاله مورد نظر با موفقیت بازگردانده شد",
        ...blog,
        comments,
        blogAverageScore: Math.floor(blogTotalScore / (blogScores.length + 1)),
      };
      return data;
    } else if (typeof search == "string" && search) {
      const blogSearch: IBlog | null = await BlogModel.findOne({ $text: { $search: search } })
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

      const comments: IComment[] = await CommentModel.find({
        blogName: blogSearch?._id,
        show: 1,
      })
        .populate([
          { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
        ])
        .lean();

      let blogTotalScore: number = 5;

      let blogScores: IComment[] = comments?.filter((comment) => {
        if (comment.blogName) {
          if (comment.blogName.toString() === blogSearch?._id.toString()) {
            return comment;
          }
        }
      });

      blogScores.forEach((comment) => {
        blogTotalScore += Number(comment.score);
      });

      if (!blogSearch) {
        throw createHttpError.NotFound("مقاله مورد نظر یافت نشد");
      }
      const data = {
        message: "مقاله مورد نظر با موفقیت بازگردانی شد",
        ...blogSearch,
        comments,
        blogAverageScore: Math.floor(blogTotalScore / (blogScores.length + 1)),
      };
      return data;
    }
  }
}
