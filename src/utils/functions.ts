import JWT from "jsonwebtoken";
import { constants } from "./constans.utils";
import { JwtToken } from "../http/types/public/public.types";
import { compareSync } from "bcrypt";
import path from "path";
import fs from "fs";

export class FunctionUtils {
  public static RandomNumberGenerator(): number {
    return ~~(Math.random() * 90000 + 10000);
  }
  public static SignAccessToken(payload: JwtToken): string {
    const options = {
      expiresIn: "30d",
    };
    return JWT.sign(payload, constants.ACCESS_TOKEN_SECRET_KEY, options);
  }

  public static comparePassword(password: string, hashedPassword: string): boolean {
    return compareSync(password, hashedPassword);
  }

  public static ListOfImagesForRequest(files: Express.Multer.File[], fileUploadPath: string) {
    if (files) {
      return files
        .map((file) => path.join(`http://127.0.0.1:8888/`, fileUploadPath, file.filename))
        .map((item) => item.replace(/\\/g, "//"));
    } else {
      return [];
    }
  }

  public static deleteFileInPublic(fileAddress: string): void {
    if (fileAddress) {
      const pathFile = path.join(__dirname, "..", "..", "public", fileAddress);
      if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile);
    }
  }
}
