import { Request } from "express";
import { errorHandler } from "../../../utils/ApiErrorHandler";
import { CreateOffDto } from "../../dtos/off/off.dto";
import { OffModel } from "../../models/off/off.model";
import { IOff } from "../../types/off/off.types";
import { IUser } from "../../types/user/user.types";

export class OffService {
  async createForProduct(createOffDto: CreateOffDto, req: Request): Promise<IOff | null> {
    errorHandler(createOffDto);
    const { code, percent, max, product } = createOffDto;
    const user: IUser | undefined = req.user;
    const newOff: IOff = await OffModel.create({
      code,
      percent,
      max,
      product,
      uses: 0,
      creator: user?._id,
    });
    return newOff;
  }

  async createForCourse(createOffDto: CreateOffDto, req: Request): Promise<IOff | null> {
    errorHandler(createOffDto);
    const { code, percent, max, course } = createOffDto;
    const user: IUser | undefined = req.user;
    const newOff: IOff = await OffModel.create({
      code,
      percent,
      max,
      course,
      uses: 0,
      creator: user?._id,
    });
    return newOff;
  }
  
  async getAll(): Promise<IOff[]> {
    const list: IOff[] = await OffModel.find({})
      .populate([
        {
          path: "creator",
          select: {
            first_name: 1,
            last_name: 1,
            username: 1,
            _id: 0,
          },
        },
        {
          path: "product",
          select: {
            title: 1,
            short_title: 1,
            text: 1,
            short_text: 1,
            _id: 0,
          },
        },
        {
          path: "course",
          select: {
            title: 1,
            text: 1,
            short_text: 1,
            _id: 0,
          },
        },
      ])
      .lean();
    return list;
  }
}
