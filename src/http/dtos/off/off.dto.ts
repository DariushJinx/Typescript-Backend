import { Expose } from "class-transformer";
import { IsDefined, Matches, Length, IsOptional } from "class-validator";
import { constants } from "../../../utils/constans.utils";

export class CreateOffDto {
  @IsDefined({ message: "کد ارسال شده صحیح نمی باشد" })
  @Expose()
  code: string;
  @IsDefined({ message: "عنوان کوتاه ارسالی محصول یافت نشد" })
  @Expose()
  @Length(0, 100, { message: "درصد تخفیف ارسالی صحیح نمی باشد" })
  percent: string;
  @IsOptional()
  @Expose()
  @Matches(constants.MongoIDPattern, { message: "شناسه محصول جهت تخفیف صحیح نمی باشد" })
  product: string;
  @IsOptional()
  @Expose()
  @Matches(constants.MongoIDPattern, { message: "شناسه دوره جهت تخفیف صحیح نمی باشد" })
  course: string;
  @IsDefined({ message: " تعداد کاربران ارسالی جهت تخفیف صحیح نمی باشد" })
  @Expose()
  @Length(1)
  @IsOptional()
  max: number;
}
export class GetOneOffProductDto {
  @IsOptional()
  @Expose()
  @Matches(constants.MongoIDPattern, { message: "شناسه محصول جهت تخفیف صحیح نمی باشد" })
  product: string;
}
export class GetOneOffCourseDto {
  @IsOptional()
  @Expose()
  @Matches(constants.MongoIDPattern, { message: "شناسه دوره جهت تخفیف صحیح نمی باشد" })
  course: string;
}
export class SetDiscountOnAllDto {
  @IsDefined({ message: "کد ارسال شده صحیح نمی باشد" })
  @Expose()
  @Length(0, 100, { message: "تخفیف ارسالی برای تمام محصولات صحیح نمی باشد" })
  discount: number;
}
