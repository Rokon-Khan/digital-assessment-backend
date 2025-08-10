import { Router } from "express";
import { authenticateAccess } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { AssessmentController } from "../modules/assessment/assessment.controller";

export const assessmentRouter = Router();

assessmentRouter.get(
  "/assessment/start",
  authenticateAccess,
  requireRole("student"),
  AssessmentController.start
);
assessmentRouter.post(
  "/assessment/submit",
  authenticateAccess,
  requireRole("student"),
  AssessmentController.submit
);
assessmentRouter.get(
  "/assessment/status",
  authenticateAccess,
  requireRole("student"),
  AssessmentController.status
);
assessmentRouter.get(
  "/assessment/history",
  authenticateAccess,
  requireRole("student"),
  AssessmentController.history
);
