import { Expose } from "class-transformer";
import { IsDefined, Matches } from "class-validator";
import { constants } from "../../../utils/constans.utils";

export class ChangeRoleDto {
  @IsDefined({ message: "نقش وارد شده صحیح نمی باشد" })
  @Expose()
  role: string;
  @IsDefined({ message: "نقش وارد شده صحیح نمی باشد" })
  @Expose()
  @Matches(constants.MongoIDPattern, { message: "شناسه وارد شده صحیح نمی باشد" })
  id: string;
}
export class BanUserDto {
  @IsDefined({ message: "نقش وارد شده صحیح نمی باشد" })
  @Expose()
  @Matches(constants.MongoIDPattern, { message: "شناسه وارد شده صحیح نمی باشد" })
  id: string;
}
