import { NextFunction, Request, Response } from "express";
import { UserRole } from "../types/interfaces.js";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.user as { role?: UserRole })?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}
