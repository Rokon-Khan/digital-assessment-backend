import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../config/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string };
    }
  }
}

export function authenticateAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });
  const token = header.split(" ")[1];
  try {
    const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET!);
    if (payload.type !== "access")
      return res.status(401).json({ error: "Invalid token type" });
    req.user = { sub: payload.sub };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
