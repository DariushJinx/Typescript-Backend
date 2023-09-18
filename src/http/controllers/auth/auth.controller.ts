import { Controller, Post } from "@overnightjs/core";
import { Request, Response, NextFunction } from "express";
import { CheckOtpDto, GetOtpDto, LoginDto, RegisterDto } from "../../dtos/auth/auth.dto";
import { UserModel } from "../../models/user/user.model";
import { StatusCodes } from "http-status-codes";
import { plainToClass } from "class-transformer";
import { FunctionUtils } from "../../../utils/functions";
import { IUser } from "../../types/user/user.types";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import { AuthService } from "../../services/auth/auth.service";
import { BanModel } from "../../models/ban/ban.model";
import { IBanUser } from "../../types/ban/ban.types";
import createHttpError from "http-errors";
@Controller("auth")
export class AuthController {
  private authService: AuthService = new AuthService();
  @Post("getOtp")
  async getOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const getOtpDto: GetOtpDto = plainToClass(GetOtpDto, req.body, {
        excludeExtraneousValues: true,
      });
      errorHandler(getOtpDto);
      const isUserBan: IBanUser[] | null = await BanModel.find({ mobile: getOtpDto.mobile });
      if (isUserBan.length) {
        return res.status(StatusCodes.FORBIDDEN).json({
          statusCode: StatusCodes.FORBIDDEN,
          data: {
            message: "این شماره تماس مسدود شده است!!!",
          },
        });
      }
      const code: number = FunctionUtils.RandomNumberGenerator();
      const result: IUser | null = await this.saveUser(code, getOtpDto.mobile, res);
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

  @Post("check-otp")
  async checkOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const checkOtpDto: CheckOtpDto = plainToClass(CheckOtpDto, req.body, {
        excludeExtraneousValues: true,
      });

      errorHandler(checkOtpDto);
    const { code, mobile } = checkOtpDto;
    const user: IUser | null = await UserModel.findOne({ mobile: mobile }, { password: 0 });
    if (!user) throw createHttpError.NotFound("کاربر مورد نظر یافت نشد");
    if (user.code != code) throw createHttpError.Unauthorized("کد وارد شده صحیح نمی باشد");
    const now = new Date().getTime();
    if (+user.expiresIn < now) throw createHttpError.Unauthorized("کد وارد شده منقضی شده است");
    const accessToken = FunctionUtils.SignAccessToken({ mobile: user.mobile, id: user._id });
    user.accessToken = accessToken;

      // const user: IUser | null = await this.authService.checkOtp(checkOtpDto);
      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "کد وارد شده صحیح می باشد",
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Post("register")
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const registerDto: RegisterDto = plainToClass(RegisterDto, req.body, {
        excludeExtraneousValues: true,
      });
      const user: IUser | null = await this.authService.register(registerDto);
      const isUserBan: IBanUser[] | null = await BanModel.find({ mobile: user.mobile });
      if (isUserBan.length) {
        return res.status(StatusCodes.FORBIDDEN).json({
          statusCode: StatusCodes.FORBIDDEN,
          data: {
            message: "این شماره تماس مسدود شده است!!!",
          },
        });
      }
      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        data: {
          message: "ثبت نام شما با موفقیت انجام شد",
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @Post("login")
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginDto: LoginDto = plainToClass(LoginDto, req.body, {
        excludeExtraneousValues: true,
      });
      const user: IUser | null = await this.authService.login(loginDto);
      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        data: {
          message: "شما با موفقیت وارد شدید",
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async saveUser(code: number, mobile: string, res: any): Promise<any> {
    const now: number = new Date().getTime();
    let expiresIn: number = now + 20000;
    const user: IUser | null = await this.checkExistUser(mobile);
    const countOfRegisteredUser: number = await UserModel.count();
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
      role: countOfRegisteredUser > 0 ? "USER" : "ADMIN",
    });
  }

  async checkExistUser(mobile: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ mobile });
    return user;
  }

  async updateUser(mobile: string, objectData: {} = {}): Promise<boolean> {
    const updateResult = await UserModel.updateOne({ mobile }, { $set: objectData });

    return !!updateResult.modifiedCount;
  }
}
