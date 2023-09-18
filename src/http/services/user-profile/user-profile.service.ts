import { BlogModel } from "../../models/blog/blog.model";
import { CourseModel } from "../../models/course/course.model";
import { ProductModel } from "../../models/product/product.model";
import { IBlog } from "../../types/blog/blog.types";
import { ICourse } from "../../types/course/course.types";
import { IProduct } from "../../types/product/product.types";
import { IUser } from "../../types/user/user.types";

export class UserProfileService {
  async getUserBookmarkedBlogs(user: IUser): Promise<IBlog[]> {
    const blogs: IBlog[] = await BlogModel.find({ bookmarks: user?._id })
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
    return blogs;
  }

  async getUserBookmarkedProducts(user: IUser): Promise<IProduct[]> {
    const products: IProduct[] = await ProductModel.find({ bookmarks: user?._id })
      .populate([
        {
          path: "supplier",
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
    return products;
  }

  async getUserBookmarkedCourses(user: IUser): Promise<ICourse[]> {
    const courses: ICourse[] = await CourseModel.find({ bookmarks: user?._id })
      .populate([
        {
          path: "teacher",
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
    return courses;
  }
}
