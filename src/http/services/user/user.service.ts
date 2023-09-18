import { UserModel } from "../../models/user/user.model";
import { IUser } from "../../types/user/user.types";
import { BanUserDto, ChangeRoleDto } from "../../dtos/user/user.dto";
import { errorHandler } from "../../../utils/ApiErrorHandler";

export class UserService {
  async changeRoles(changeRoleDto: ChangeRoleDto): Promise<string> {
    errorHandler(changeRoleDto);
    const { id, role } = changeRoleDto;
    let message: string;
    await UserModel.findByIdAndUpdate({ _id: id }, { role: role });
    return (message = "نقش کاربر مورد نظر تغییر یافت");
  }

  async banUser(banUserDto: BanUserDto): Promise<IUser|null> {
    errorHandler(banUserDto);
    const { id } = banUserDto;
    const mainUser: IUser | null = await UserModel.findOne({ _id: id }).lean();
    
    return mainUser;
  }
}
