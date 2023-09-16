import { Controller, Post, Middleware, Get, Delete, Patch } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { Upload } from "../../../utils/multer";
import { StatusCodes } from "http-status-codes";
import { AuthMiddleware } from "../../middlewares/authMiddleware";
import { FunctionUtils } from "../../../utils/functions";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import { CourseModel } from "../../models/course/course.model";
import { CreateCourseDto } from "../../dtos/course/course.dto";
import { stringToArray } from "../../middlewares/stringToArray";
import { CourseUserModel } from "../../models/courseUser/courseUser.model";
import { CommentModel } from "../../models/comment/comment.model";
import { IComment } from "../../types/comment/comment.types";
import { ICourse } from "../../types/course/course.types";
import mongoose from "mongoose";
import { IUser } from "../../types/user/user.types";
import { CourseService } from "../../services/course/course.service";

@Controller("courses")
export class CourseController {
  private courseService: CourseService = new CourseService();
  @Post("add")
  @Middleware(AuthMiddleware)
  @Middleware(Upload.uploadFile.array("images", 10))
  @Middleware(stringToArray("tags"))
  async addCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const createCourseDto: CreateCourseDto = plainToClass(CreateCourseDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(createCourseDto);
      const files = req.files as { [filename: string]: Express.Multer.File[] };
      if (Array.isArray(files)) {
        const images: string[] = FunctionUtils.ListOfImagesForRequest(
          files || [],
          req.body.fileUploadPath
        );
        const {
          title,
          short_text,
          text,
          tags,
          category,
          price,
          discount = 0,
          type,
        } = createCourseDto;
        if (Number(price) > 0 && type === "free") {
          return res.status(StatusCodes.BAD_REQUEST).json({
            statusCode: StatusCodes.BAD_REQUEST,
            data: {
              message: "برای دوره ی رایگان نمیتوان قیمت ثبت کرد",
            },
          });
        }
        const course: ICourse | null = await CourseModel.create({
          title,
          short_text,
          text,
          tags,
          category,
          price,
          discount,
          type,
          images,
          status: "notStarted",
          teacher: req.user?._id,
        });
        if (!course?._id) {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
              message: "دوره ثبت نشد",
            },
          });
        }
        return res.status(StatusCodes.CREATED).json({
          statusCode: StatusCodes.CREATED,
          data: {
            message: "دوره با موفقیت ایجاد شد",
            course,
          },
        });
      }
    } catch (error) {
      FunctionUtils.deleteFileInPublic(req?.body?.images);
      next(error);
    }
  }

  @Get("list")
  async getListOfCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      let courses;
      if (typeof search == "string" && search)
        courses = await CourseModel.find({ $text: { $search: search } })
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
          .lean()
          .sort({ _id: -1 });
      else
        courses = await CourseModel.find({})
          .populate([
            { path: "category", select: { children: 0, parent: 0, __v: 0 } },
            { path: "teacher", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
          ])
          .lean()
          .sort({ _id: -1 });

      const registers = await CourseUserModel.find({});

      const comments = await CommentModel.find({ show: 1 })
        .populate([
          { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
        ])
        .lean();

      let allCourses: object[] = [];
      courses.forEach(async (course) => {
        let courseTotalScore = 5;
        let courseRegisters = registers.filter((register) => {
          if (register.course.toString() === course._id.toString()) {
            return register;
          }
        });

        let courseScores = comments.filter((comment) => {
          if (comment.courseName) {
            if (comment.courseName.toString() === course._id.toString()) {
              return comment;
            }
          }
        });

        let courseComments: IComment[] = comments.filter((comment) => {
          if (comment.courseName) {
            if (comment.courseName.toString() === course._id.toString()) {
              return comment;
            }
          }
        });

        courseScores.forEach((comment) => {
          courseTotalScore += Number(comment.score);
        });

        allCourses.push({
          ...course,
          courseComments,
          courseAverageScore: Math.floor(courseTotalScore / (courseScores.length + 1)),
          registers: courseRegisters.length,
        });
      });

      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "تمامی دوره های موجود با موفقیت بازگردانی شدند",
          allCourses,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  @Get(":title")
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { title } = req.params;

      const course: ICourse | null = await this.courseService.getOne(title);

      const comments: IComment[] | null = await CommentModel.find({
        courseName: course?._id,
        show: 1,
      })
        .populate([
          { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
        ])
        .lean();

      let courseTotalScore = 5;

      let courseScores: IComment[] | undefined = comments?.filter((comment) => {
        if (comment.courseName) {
          if (comment.courseName.toString() === course?._id.toString()) {
            return comment;
          }
        }
      });

      courseScores?.forEach((comment) => {
        courseTotalScore += Number(comment.score);
      });

      let isUserRegisteredToThisCourse: any = null;
      if (req.user) {
        isUserRegisteredToThisCourse = !!(await CourseUserModel.findOne({
          user: req.user._id,
          course: course?._id,
        }));
      } else {
        isUserRegisteredToThisCourse = false;
      }

      const courseStudentsCount = await CourseUserModel.find({
        course: course?._id,
      }).count();

      if (courseScores) {
        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            ...course,
            comments,
            courseAverageScore: Math.floor(courseTotalScore / (courseScores.length + 1)),
            isUserRegisteredToThisCourse,
            courseStudentsCount,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  @Patch("update/:id")
  @Middleware(AuthMiddleware)
  @Middleware(Upload.uploadFile.array("images", 10))
  @Middleware(stringToArray("tags"))
  async updateCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await FunctionUtils.findCourseById(id);
      const data = FunctionUtils.copyObject(req.body);
      let blackListFields = [
        "time",
        "chapters",
        "episodes",
        "students",
        "bookmarks",
        "likes",
        "dislikes",
        "comments",
      ];
      FunctionUtils.deleteInvalidPropertyInObject(data, blackListFields);
      const files = req.files as { [filename: string]: Express.Multer.File[] };
      if (Array.isArray(files)) {
        if (req?.body?.fileUploadPath && files) {
          FunctionUtils.ListOfImagesForRequest(files || [], req.body.fileUploadPath);
        }
        const updateCourseResult = await CourseModel.updateOne(
          { _id: id },
          {
            $set: data,
          }
        );
        if (!updateCourseResult.modifiedCount) {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
              message: "به روزرسانی دوره انجام نشد",
            },
          });
        }

        return res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          data: {
            message: "به روزرسانی دوره با موفقیت انجام شد",
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  @Delete("remove/:id")
  @Middleware(AuthMiddleware)
  async removeCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const findQuery = mongoose.isValidObjectId(id) ? { _id: id } : { title: id };
      const course = await CourseModel.findOne(findQuery);
      if (!course) {
        return res.status(StatusCodes.NOT_FOUND).json({
          statusCode: StatusCodes.NOT_FOUND,
          data: {
            message: "دوره مورد نظر یافت نشد",
          },
        });
      }
      const removeResult = await CourseModel.deleteOne({ _id: course._id });
      if (!removeResult.deletedCount) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "دوره مورد نظر حذف نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "دوره مورد نظر با موفقیت حذف شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Post("user-register-course/:courseID")
  @Middleware(AuthMiddleware)
  async userRegisterCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseID } = req.params;
      const user = req.user;
      const course = await CourseModel.findOne({ _id: courseID }).lean();
      await CourseModel.updateOne(
        { _id: courseID },
        {
          $set: {
            students: user,
          },
        }
      );
      const isUserAlreadyRegistered = await CourseUserModel.findOne({
        user: user?._id,
        course: courseID,
      }).lean();
      if (isUserAlreadyRegistered) {
        return res.status(StatusCodes.CONFLICT).json({
          statusCode: StatusCodes.CONFLICT,
          data: {
            message: "شما قبلا در این دوره ثبت نام کرده اید",
          },
        });
      }
      await CourseUserModel.create({
        user: user?._id,
        course: courseID,
        price: course?.price,
      });
      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "شما با موفقیت در دوره ثبت نام کردید",
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Get("bookmark/:courseID")
  @Middleware(AuthMiddleware)
  async bookmarkedCourseWithCourseID(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseID } = req.params;
      await FunctionUtils.findCourseWithTitleOrID(courseID, res);
      const user: IUser | undefined = req.user;
      const bookmarkedCourse = await CourseModel.findOne({
        _id: courseID,
        bookmarks: user?._id,
      });
      const updateQuery = bookmarkedCourse
        ? { $pull: { bookmarks: user?._id } }
        : { $push: { bookmarks: user?._id } };
      await CourseModel.updateOne({ _id: courseID }, updateQuery);
      let message;
      if (!bookmarkedCourse) message = "دوره مورد نظر به لیست علاقه مندی های شما اضافه شد";
      else message = "دوره مورد نظر از لیست علاقه مندی های شما حذف شد";
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

  @Get("like/:courseID")
  @Middleware(AuthMiddleware)
  async likedCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseID } = req.params;
      await FunctionUtils.findCourseWithTitleOrID(courseID, res);
      const user = req.user;
      const likedCourse = await CourseModel.findOne({
        _id: courseID,
        likes: user?._id,
      });
      const dislikedCourse = await CourseModel.findOne({
        _id: courseID,
        dislikes: user?._id,
      });
      const updateQueryForLikes = likedCourse
        ? { $pull: { likes: user?._id } }
        : { $push: { likes: user?._id } };
      const updateQueryForDislikes = dislikedCourse && {
        $pull: { dislikes: user?._id },
      };
      await CourseModel.updateOne({ _id: courseID }, updateQueryForLikes);
      let message;
      if (!likedCourse) {
        if (updateQueryForDislikes) {
          if (dislikedCourse)
            await CourseModel.updateOne({ _id: courseID }, updateQueryForDislikes);
        }
        message = "پسندیدن دوره با موفقیت انجام شد";
      } else message = "پسندیدن دوره با موفقیت لغو شد";
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

  @Get("dislike/:courseID")
  @Middleware(AuthMiddleware)
  async dislikedCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseID } = req.params;
      await FunctionUtils.findCourseWithTitleOrID(courseID, res);
      const user = req.user;
      const likesCourse = await CourseModel.findOne({
        _id: courseID,
        likes: user?._id,
      });
      const dislikesCourse = await CourseModel.findOne({
        _id: courseID,
        dislikes: user?._id,
      });
      const updateQueryForDislikes = dislikesCourse
        ? { $pull: { dislikes: user?._id } }
        : { $push: { dislikes: user?._id } };
      const updateQueryForLikes = likesCourse && {
        $pull: { likes: user?._id },
      };
      await CourseModel.updateOne({ _id: courseID }, updateQueryForDislikes);
      let message;
      if (!dislikesCourse) {
        if (updateQueryForLikes) {
          if (likesCourse) await CourseModel.updateOne({ _id: courseID }, updateQueryForLikes);
        }
        message = "نپسندیدن دوره با موفقیت انجام شد";
      } else message = "نپسندیدن دوره با موفقیت لغو شد";
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
