import { Request } from "express";

import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import createHttpError from "http-errors";

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const createRoute = (req: Request) => {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = date.getMonth().toString();
  const day = date.getDate().toString();
  const directory = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "uploads",
    "blogs",
    year,
    month,
    day
  );
  req.body.fileUploadPath = path.join("uploads", "blogs", year, month, day);
  fs.mkdirSync(directory, { recursive: true });
  return directory;
};

const storage = multer.diskStorage({
  destination: (
    request: Request,
    file: Express.Multer.File,
    callback: DestinationCallback
  ): void => {
    if (file?.originalname) {
      const filePath = createRoute(request);
      return callback(null, filePath);
    }
  },

  filename: (request: Request, file: Express.Multer.File, callback: FileNameCallback): void => {
    if (file.originalname) {
      const fileName = String(file.originalname);
      request.body.filename = fileName;
      return callback(null, fileName);
    }
  },
});

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  const ext = path.extname(file.originalname);
  const mimeTypes = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".mp4",
    ".mpg",
    ".mov",
    ".avi",
    ".mkv",
  ];
  if (mimeTypes.includes(ext)) return cb(null, true);
  return cb(createHttpError.BadRequest("فرمت عکس ارسالی صحیح نمی باشد"));
}
// function videoFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
//   const ext = path.extname(file.originalname);
//   const mimeTypes = [".mp4", ".mpg", ".mov", ".avi", ".mkv"];
//   if (mimeTypes.includes(ext)) return cb(null, true);
//   return cb(createHttpError.BadRequest("فرمت ارسال شده ویدیو صحیح نمیباشد"));
// }

const pictureMaxSize = 3 * 1000 * 1000; //3mb
const videoMaxSize = 500 * 1000 * 1000; //500MB

const uploadFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: pictureMaxSize },
});
const uploadVideo = multer({ storage, fileFilter, limits: { fileSize: videoMaxSize } });

export const Upload = {
  uploadFile,
  uploadVideo,
};
