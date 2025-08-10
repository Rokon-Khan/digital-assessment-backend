import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "Not Found" });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: "ValidationError", details: err.flatten() });
  }
  const status = (err as any)?.status || 500;
  logger.error({ err }, "Unhandled error");
  res
    .status(status)
    .json({ error: (err as any)?.message || "Internal Server Error" });
}
