import { Expose } from "class-transformer";
import { IsDefined, Matches, Length, Allow, IsOptional } from "class-validator";
import { constants } from "../../../utils/constans.utils";
export class CreateCommentDto {
  @IsDefined()
  @Expose()
  comment: string;
  @Expose()
  @IsOptional()
  blogName?: string;
  @Expose()
  @IsOptional()
  productName?: string;
  @Expose()
  @IsOptional()
  courseName?: string;
  @IsOptional()
  @Expose()
  score: number;
  
}