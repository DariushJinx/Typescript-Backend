import { Expose } from "class-transformer";
import { IsDefined, Length } from "class-validator";

export class CreatePermissionDto {
  @IsDefined({ message: "عنوان ارسالی برای دسترسی صحیح نمی باشد" })
  @Expose()
  @Length(3, 30, { message: "تعداد کاراکتر های وارد شده صحیح نمی باشد" })
  name: string;
  @IsDefined({ message: "توضیحات ارسالی برای دسترسی صحیح نمی باشد" })
  @Expose()
  @Length(0, 100, { message: "توضیحات ارسالی برای دسترسی صحیح نمی باشد" })
  description: string;
}
