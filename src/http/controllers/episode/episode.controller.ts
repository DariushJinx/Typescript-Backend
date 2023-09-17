import { Controller, Post, Middleware, Get, Delete, Patch } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { Upload } from "../../../utils/multer";
import { StatusCodes } from "http-status-codes";
import { AuthMiddleware } from "../../middlewares/authMiddleware";
import { FunctionUtils } from "../../../utils/functions";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import { getVideoDurationInSeconds } from "get-video-duration";
import { CourseModel } from "../../models/course/course.model";
import { CreateEpisodeDto } from "../../dtos/course/course.dto";
import { EpisodeService } from "../../services/episode/episode.service";
import path from "path";

@Controller("episode")
export class EpisodeController {
  private episodeService: EpisodeService = new EpisodeService();
  @Post("add")
  @Middleware(AuthMiddleware)
  @Middleware(Upload.uploadVideo.single("video"))
  async addNewEpisode(req: Request, res: Response, next: NextFunction) {
    try {
      const createEpisodeDto: CreateEpisodeDto = plainToClass(CreateEpisodeDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(createEpisodeDto);
      const { title, text, type, chapterID, courseID, filename } = createEpisodeDto;
      const { fileUploadPath } = req.body;
      const fileAddress: string = path.join(fileUploadPath, filename);
      const videoAddress: string = fileAddress.replace(/\\/g, "//");
      const videoURL: string = `http://127.0.0.1:8888/${videoAddress}`;
      const seconds: number = await getVideoDurationInSeconds(videoURL);
      const time: string = FunctionUtils.getTime(seconds);
      const episode: {
        title: string;
        text: string;
        type: string;
        time: string;
        videoAddress: string;
      } = {
        title,
        text,
        type,
        time,
        videoAddress: videoURL,
      };
      const createEpisodeResult = await CourseModel.updateOne(
        {
          _id: courseID,
          "chapters._id": chapterID,
        },
        {
          $push: {
            "chapters.$.episodes": episode,
          },
        }
      );
      if (createEpisodeResult.modifiedCount == 0) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "افزودن اپیزود انجام نشد",
          },
        });
      }
      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "افزودن اپیزود با موفقیت انجام شد",
        },
      });
    } catch (error) {
      FunctionUtils.deleteFileInPublic(req.body.videoAddress);
      next(error);
    }
  }
  @Patch("remove/:episodeID")
  @Middleware(AuthMiddleware)
  async removeEpisode(req: Request, res: Response, next: NextFunction) {
    try {
      const { episodeID } = req.params;
      await this.episodeService.getEpisode(CourseModel, episodeID);
      const removeEpisodeResult = await CourseModel.updateOne(
        {
          "chapters.episodes._id": episodeID,
        },
        {
          $pull: {
            "chapters.$.episodes": {
              _id: episodeID,
            },
          },
        }
      );

      if (!removeEpisodeResult.modifiedCount) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: {
            message: "حذف اپیزود انجام نشد",
          },
        });
      }
      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "حذف اپیزود با موفقیت انجام شد",
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
