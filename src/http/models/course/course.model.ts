import { IChapter } from "../../types/chapter/chapter.types";
import { ICourse } from "../../types/course/course.types";
import { IEpisode } from "../../types/episode/episode.types";

import mongoose from "mongoose";
const Episodes = new mongoose.Schema<IEpisode>(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, default: "unlock" },
    time: { type: String, required: true },
    videoAddress: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

Episodes.virtual("videoURL").get(function (this: { videoAddress: string }) {
  return `${process.env.BASE_URL}:${process.env.APPLICATION_PORT}/${this.videoAddress}`;
});

const Chapter = new mongoose.Schema<IChapter>(
  {
    title: { type: String, required: true },
    text: { type: String, default: "" },
    episodes: { type: [Episodes], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

const schema = new mongoose.Schema<ICourse>(
  {
    title: { type: String, required: true },
    short_text: { type: String, required: true },
    text: { type: String, required: true },
    images: { type: [String], required: true },
    tags: { type: [String], default: [] },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    likes: { type: [mongoose.Types.ObjectId], ref: "user", default: [] },
    dislikes: { type: [mongoose.Types.ObjectId], ref: "user", default: [] },
    bookmarks: { type: [mongoose.Types.ObjectId], ref: "user", default: [] },
    price: { type: Number, default: 0, required: true },
    discount: { type: Number, default: 0 },
    type: {
      type: String,
      default: "free" /*free,cash,special*/,
      required: true,
    },
    status: {
      type: String,
      default: "notStarted" /*notStarted,completed,holding*/,
    },
    teacher: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    chapters: { type: [Chapter], default: [] },
    students: { type: [mongoose.Types.ObjectId], ref: "user", default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

schema.index({ title: "text", short_text: "text", text: "text" });

export const CourseModel = mongoose.model("courses", schema);
