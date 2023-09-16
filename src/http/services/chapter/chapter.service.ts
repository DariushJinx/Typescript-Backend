import { Response } from "express";
import { CourseModel } from "../../models/course/course.model";
import { StatusCodes } from "http-status-codes";
import { IChapter } from "../../types/chapter/chapter.types";
import createHttpError from "http-errors";

export class ChapterService {
  async getChaptersOfCourse(id: string): Promise<IChapter[]> {
    const chapters: IChapter[] | null = await CourseModel.findOne(
      { _id: id },
      { chapters: 1, title: 1 }
    );
    if (chapters) {
      return chapters;
    } else {
      throw createHttpError.NotFound("دوره ای با این شناسه یافت نشد");
    }
  }

  async getOneChapter(id: string): Promise<IChapter> {
    const chapter: IChapter | null = await CourseModel.findOne(
      { "chapters._id": id },
      { "chapters.$": 1 }
    );
    if (chapter) {
      return chapter;
    } else {
      throw createHttpError.NotFound("فصلی با این شناسه یافت نشد");
    }
  }
}
