import mongoose from "mongoose";
import { ICourseUser } from "../../types/course-user/course-user.types";

const CourseUserSchema = new mongoose.Schema<ICourseUser>(
  {
    course: { type: mongoose.Types.ObjectId, res: "courses" },
    user: { type: mongoose.Types.ObjectId, res: "user" },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const CourseUserModel = mongoose.model("courseUser", CourseUserSchema);
