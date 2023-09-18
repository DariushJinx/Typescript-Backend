import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import { CheckOtpDto, LoginDto, RegisterDto } from "../../dtos/auth/auth.dto";
import { UserModel } from "../../models/user/user.model";
import { IUser } from "../../types/user/user.types";
import { FunctionUtils } from "../../../utils/functions";
export class AuthService {
  async checkOtp(checkOtpDto: CheckOtpDto): Promise<IUser> {
    errorHandler(checkOtpDto);
    const { code, mobile } = checkOtpDto;
    const user: IUser | null = await UserModel.findOne({ mobile: mobile }, { password: 0 });
    if (!user) throw createHttpError.NotFound("کاربر مورد نظر یافت نشد");
    if (user.code != code) throw createHttpError.Unauthorized("کد وارد شده صحیح نمی باشد");
    const now = new Date().getTime();
    if (+user.expiresIn < now) throw createHttpError.Unauthorized("کد وارد شده منقضی شده است");
    const accessToken = FunctionUtils.SignAccessToken({ mobile: user.mobile, id: user._id });
    user.accessToken = accessToken;
    await user.save();
    return user;
  }
  async register(registerDto: RegisterDto): Promise<IUser> {
    errorHandler(registerDto);
    const { username, password, email, mobile, first_name, last_name } = registerDto;
    const isUserExists = await UserModel.findOne(
      {
        $or: [{ username }, { email }, { mobile }],
      },
      { expiresIn: 0 }
    );

    const countOfRegisteredUser = await UserModel.count();

    if (isUserExists)
      throw createHttpError.Conflict("ایمیل و یا یوزرنیم و یا موبایل شما تکراری می باشد");
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      email,
      username,
      first_name,
      last_name,
      mobile,
      password: hashedPassword,
      role: countOfRegisteredUser > 2 ? "USER" : "ADMIN",
    });
    const accessToken = FunctionUtils.SignAccessToken({ mobile, username, id: user._id });
    user.accessToken = accessToken;
    const userObject = user.toObject();
    Reflect.deleteProperty(userObject, "password");
    Reflect.deleteProperty(userObject, "code");
    Reflect.deleteProperty(userObject, "expiresIn");
    return user;
  }
  async login(loginDto: LoginDto): Promise<IUser> {
    errorHandler(loginDto);
    const { username, password } = loginDto;
    const user: IUser | null = await UserModel.findOne({ username: username });
    if (!user) throw createHttpError.Unauthorized("کاربری با این ایمیل و یا یوزرنیم یافت نشد");
    const isTrueUser: boolean = FunctionUtils.comparePassword(password, user.password);
    if (!isTrueUser) throw createHttpError.Unauthorized("یوزرنیم و یا پسوورد صحیح نمی باشد");
    const accessToken: string = FunctionUtils.SignAccessToken({
      mobile: user.mobile,
      username: username,
      id: user._id,
    });
    user.accessToken = accessToken;
    await user.save();
    return user;
  }
}
