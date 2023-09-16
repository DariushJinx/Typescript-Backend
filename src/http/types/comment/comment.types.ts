import { Document, ObjectId } from "mongoose";

export interface IComment extends Document {
  show: number;
  commentUser: ObjectId;
  comment: string;
  score: number;
  openToComment: boolean;
  answers: object[];
  blogName: ObjectId;
  courseName: ObjectId;
  productName: ObjectId;
}

export interface IAnswerComment extends Document {
  AnswerUser: ObjectId;
  comment: string;
  openToComment: boolean;
}
