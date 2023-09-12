import { Expose } from "class-transformer";
import { IsDefined, Matches, Length, IsNotEmpty } from "class-validator";

export class GetOtpDto {
  @IsDefined()
  @Expose()
  @Matches(RegExp(/^09\d{9}$/), { message: "فرمت شماره تماس وارد شده صحیح نمی باشد" })
  @Length(11, 11, { message: "تعداد کاراکترهای شماره تماس باید 11 عدد باشد" })
  @IsNotEmpty({ message: "شماره تماس وارد شده نباید خالی باشد" })
  mobile: string;
}
