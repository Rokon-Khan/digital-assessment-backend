import { NextFunction, Request, Response } from "express";
import { UserModel } from "../modules/user/user.model";
// import { UserModel } from '../models/User.model.js';

export async function ensureSupervisorApproved(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "supervisor") return next(); // Not a supervisor => proceed (admin or student)
  const user = await UserModel.findById(req.user.sub).select(
    "supervisorApproved"
  );
  if (!user?.supervisorApproved) {
    return res
      .status(403)
      .json({ error: "Supervisor not approved by admin yet" });
  }
  return next();
}
