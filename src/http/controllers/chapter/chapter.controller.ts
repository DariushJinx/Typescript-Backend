import { Controller, Post, Middleware, Get, Delete, Patch, Put } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthMiddleware } from "../../middlewares/authMiddleware";
import { FunctionUtils } from "../../../utils/functions";
import { CourseModel } from "../../models/course/course.model";
import { ChapterService } from "../../services/chapter/chapter.service";
import { IChapter } from "../../types/chapter/chapter.types";

@Controller("chapter")
export class ChapterController {
  private chapterService: ChapterService = new ChapterService();
  @Put("add")
  @Middleware(AuthMiddleware)
  async addChapter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, title, text } = req.body;
      await FunctionUtils.findCourseById(id);
      const saveChapterResult = await CourseModel.updateOne(
        { _id: id },
        {
          $push: {
            chapters: { title, text, episodes: [] },
          },
        }
      );
      if (saveChapterResult.modifiedCount == 0) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "فصل افزوده نشد",
          },
        });
      }
      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "فصل با موفقیت ایجاد شد",
        },
      });
    } catch (error) {
      next(error);
    }
  }
  @Get("list/:courseID")
  @Middleware(AuthMiddleware)
  async chaptersOfCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseID } = req.params;
      const course: IChapter[] | null = await this.chapterService.getChaptersOfCourse(courseID);
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          course,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  @Patch("remove/:chapterID")
  @Middleware(AuthMiddleware)
  async removeChapterById(req: Request, res: Response, next: NextFunction) {
    try {
      const { chapterID } = req.params;
      await this.chapterService.getOneChapter(chapterID);
      const removeChapterResult = await CourseModel.updateOne(
        { "chapters._id": chapterID },
        {
          $pull: {
            chapters: {
              _id: chapterID,
            },
          },
        }
      );
      if (removeChapterResult.modifiedCount == 0) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "حذف فصل انجام نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "حذف فصل با موفقیت انجام شد",
        },
      });
    } catch (error) {
      next(error);
    }
  }
  @Patch("update/:chapterID")
  @Middleware(AuthMiddleware)
  async updateChapterById(req: Request, res: Response, next: NextFunction) {
    try {
      const { chapterID } = req.params;
      await this.chapterService.getOneChapter(chapterID);
      const data = req.body;
      FunctionUtils.deleteInvalidPropertyInObject(data, ["_id"]);
      const updateChapterResult = await CourseModel.updateOne(
        { "chapters._id": chapterID },
        { $set: { chapters: data } }
      );
      if (updateChapterResult.modifiedCount == 0) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "به روزرسانی فصل انجام نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "به روزرسانی باموفقیت انجام شد",
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
