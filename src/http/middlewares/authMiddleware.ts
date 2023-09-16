import { NextFunction, Request, Response } from "express";
import JWT from "jsonwebtoken";
import { IUser } from "../types/user/user.types";
import { UserModel } from "../models/user/user.model";
import createHttpError from "http-errors";
import { constants } from "../../utils/constans.utils";
declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}

function getToken(headers: any): any {
  const [bearer, token] = headers?.authorization?.split(" ") || [];
  if (token && ["Bearer", "bearer"].includes(bearer)) return token;
  throw createHttpError.Unauthorized("حساب کاربری مورد نظر یافت نشد || وارد حساب کاربری خود شوید");
}

export async function AuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token:string | undefined = getToken(req?.headers);
    if(token){
        JWT.verify(token, constants.ACCESS_TOKEN_SECRET_KEY, async (err: any, payload: any) => {
            try {
              if (err) throw createHttpError.Unauthorized("وارد حساب کاربری خود شوید");
              const { mobile, username } = payload || {};
              const user = await UserModel.findOne(
                {
                  $or: [{ mobile }, { username }],
                },
                { password: 0, otp: 0 }
              );
              if (!user) throw createHttpError.Unauthorized("...وارد حساب کاربری خود شوید");
              req.user = user;
              return next();
            } catch (err) {
              next(err);
            }
          });
    }else throw {status: 401, message: "UnAuthorization"}
  } catch (error) {
    next(error);
  }
}
