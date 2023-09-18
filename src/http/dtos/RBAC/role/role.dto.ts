import { Expose } from "class-transformer";
import { IsDefined, Length } from "class-validator";

export class CreateRoleDto {
  @IsDefined({ message: "عنوان ارسالی برای نقش صحیح نمی باشد" })
  @Expose()
  @Length(3, 30, { message: "تعداد کاراکتر های وارد شده صحیح نمی باشد" })
  title: string;
  @IsDefined({ message: "توضیحات ارسالی برای نقش صحیح نمی باشد" })
  @Expose()
  @Length(0, 100, { message: "توضیحات ارسالی برای نقش صحیح نمی باشد" })
  description: string;
  @IsDefined({ message: "دسترسی های ارسالی برای نقش صحیح نمی باشد" })
  @Expose()
  permissions: [key: string];
}
