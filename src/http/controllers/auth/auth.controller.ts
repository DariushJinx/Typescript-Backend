import { Controller, Post } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { GetOtpDto } from "../../dtos/auth/auth.dto";
import { UserModel } from "../../models/user/user.model";
import { StatusCodes } from "http-status-codes";
import createHttpError from "http-errors";
import { plainToClass } from "class-transformer";
import { UtilsFunctions } from "../../../utils/functions";
import { IUser } from "../../types/user/user.types";
import { errorHandler } from "../../../utils/ApiErrorHandler";
@Controller("auth")
export class AuthController {
  @Post("getOtp")
  async getOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const getOtpDto: GetOtpDto = plainToClass(GetOtpDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(getOtpDto);
      const code = UtilsFunctions.RandomNumberGenerator();
      const result = await this.saveUser(code, getOtpDto.mobile, res);
      if (!result) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          statusCode: StatusCodes.UNAUTHORIZED,
          data: {
            message: "ورود شما انجام نشد",
          },
        });
      }


      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "ورود شما با موفقیت انجام شد",
          code,
          mobile: getOtpDto.mobile,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async saveUser(code: number, mobile: string, res: any) {
    const now = new Date().getTime();
    let expiresIn: number = now + 10000;
    const user: IUser | null = await this.checkExistUser(mobile);
    const countOfRegisteredUser = await UserModel.count();
    if (user) {
      if (+user.expiresIn > now) {
        return res.status(StatusCodes.FORBIDDEN).json({
          statusCode: StatusCodes.FORBIDDEN,
          data: {
            message: "کد احراز هویت قبلی هنوز منقضی نشده است",
          },
        });
      }
      return await this.updateUser(mobile, { expiresIn, code });
    }
    return await UserModel.create({
      mobile,
      code,
      expiresIn,
      role: countOfRegisteredUser > 2 ? "USER" : "ADMIN",
    });
  }

  async checkExistUser(mobile: string) {
    const user = await UserModel.findOne({ mobile });
    return user;
  }
  async updateUser(mobile: string, objectData: {} = {}) {
    const updateResult = await UserModel.updateOne({ mobile }, { $set: objectData });

    return !!updateResult.modifiedCount;
  }
}
