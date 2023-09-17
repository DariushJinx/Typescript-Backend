import { Response } from "express";
import { CourseModel } from "../../models/course/course.model";
import { StatusCodes } from "http-status-codes";
import { IChapter } from "../../types/chapter/chapter.types";
import createHttpError from "http-errors";

export class ChapterService {
  async getChaptersOfCourse(id: string): Promise<IChapter[] | null> {
    const chapters: IChapter[] | null = await CourseModel.findOne(
      { _id: id },
      { chapters: 1, title: 1 }
    );
    return chapters;
  }

  async getOneChapter(id: string): Promise<IChapter | null> {
    const chapter: IChapter | null = await CourseModel.findOne(
      { "chapters._id": id },
      { "chapters.$": 1 }
    );
    return chapter;
  }
}
