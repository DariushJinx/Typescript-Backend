import createHttpError from "http-errors";
import { CourseModel } from "../../models/course/course.model";
import { ICourse } from "../../types/course/course.types";

export class CourseService {
  async getOne(title: string): Promise<ICourse | null> {
    const course: ICourse | null = await CourseModel.findOne({ title: title })
      .populate([
        { path: "category", select: { title: 1 } },
        { path: "teacher", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
        { path: "students", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
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
    return course;
  }
}
