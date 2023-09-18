import { NextFunction, Request, Response } from "express";

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  const isAdmin = req.user?.role === "ADMIN";

  console.log("admin : ", req.user);

  if (isAdmin) return next();

  return res.status(403).json({ message: "this route is accessible only for admins." });
}
