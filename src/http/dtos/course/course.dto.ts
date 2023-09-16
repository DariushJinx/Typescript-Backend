import { Expose } from "class-transformer";
import { IsDefined, Matches, Length, Allow, IsOptional, Min, Max } from "class-validator";
import { constants } from "../../../utils/constans.utils";

export class CreateCourseDto {
  @IsDefined({ message: "عنوان دوره یافت نشد" })
  @Expose()
  @Length(3, 30, { message: "عنوان وارد شده صحیح نمی باشد" })
  title: string;
  @IsDefined({ message: "متن دوره یافت نشد" })
  @Expose()
  text: string;
  @IsDefined({ message: "متن کوتاه دوره یافت نشد" })
  @Expose()
  short_text: string;
  @IsOptional()
  @Expose()
  tags: string[];
  @IsDefined({ message: "آیدی دسته بندی دوره یافت نشد" })
  @Expose()
  @Matches(constants.MongoIDPattern, { message: "شناسه دسته بندی وارد شده صحیح نمی باشد" })
  category: string;
  @IsDefined({ message: "قیمت وارد شده صحیح نمی باشد" })
  @Expose()
  price: number;
  @IsDefined({ message: "تخفیف وارد شده صحیح نمیباشد" })
  @Expose()
  discount: number;
  @IsDefined({ message: "نوع دوره یافت نشد" })
  @Expose()
  @Matches(/(free|cash|special)/i, { message: "نوع دوره صحیح نمی باشد" })
  type: string;
  @Expose()
  @Matches(/(\.png|\.jpg|\.webp|\.jpeg|\.gif)$/, { message: "تصویر ارسال شده صحیح نمیباشد" })
  filename: string;
  @Allow()
  fileUploadPath: string;
}

export class CreateEpisodeDto {
  @IsDefined({ message: "عنوان قسمت یافت نشد" })
  @Expose()
  @Length(3, 30, { message: "عنوان وارد شده صحیح نمی باشد" })
  title: string;
  @IsDefined({ message: "متن قسمت یافت نشد" })
  @Expose()
  text: string;
  @IsDefined({ message: "نوع قسمت یافت نشد" })
  @Expose()
  @Matches(/(lock|unlock)/i, { message: "نوع قسمت صحیح نمی باشد" })
  type: string;
  @IsDefined({ message: "آیدی دسته بندی دوره یافت نشد" })
  @Expose()
  @Matches(constants.MongoIDPattern, { message: "شناسه ی فصل صحیح نمیباشد" })
  chapterID: string;
  @IsDefined({ message: "آیدی دسته بندی دوره یافت نشد" })
  @Expose()
  @Matches(constants.MongoIDPattern, { message: "شناسه ی دوره صحیح نمیباشد" })
  courseID: string;
  @IsDefined({ message: "ویدیو ارسالی صحیح نمی باشد" })
  @Expose()
  @Matches(/(\.mp4|\.mov|\.mkv|\.mpg)$/, { message: "ویدیو ارسال شده صحیح نمیباشد" })
  filename: string;
  @Allow()
  fileUploadPath: string;
}
