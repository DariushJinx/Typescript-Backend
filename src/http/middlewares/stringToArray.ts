import { Request, Response, NextFunction } from "express";

const string = function (...args: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const fields = args;
    fields.forEach((field: string) => {
      if (req.body[field]) {
        if (typeof req.body[field] == "string") {
          if (req.body[field].indexOf("#") >= 0) {
            req.body[field] = req.body[field].split("#").map((item: string) => item.trim());
          } else if (req.body[field].indexOf(",") >= 0) {
            req.body[field] = req.body[field].split(",").map((item: string) => item.trim());
          } else {
            req.body[field] = [req.body[field]];
          }
        }
        if (Array.isArray(req.body[field])) {
          req.body[field] = req.body[field].map((item: string) => item.trim());
          req.body[field] = [...new Set(req.body[field])];
        }
      } else {
        req.body[field] = [];
      }
    });
    next();
  };
};

export const stringToArray = string;
