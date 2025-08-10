import { Router } from "express";
import { authenticateAccess } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { AnalyticsController } from "../modules//analytics/analytics.controller";

export const analyticsRouter = Router();

analyticsRouter.get(
  "/analytics/users",
  authenticateAccess,
  requireRole("admin", "supervisor"),
  AnalyticsController.users
);
analyticsRouter.get(
  "/analytics/competency",
  authenticateAccess,
  requireRole("admin", "supervisor"),
  AnalyticsController.competency
);
analyticsRouter.get(
  "/analytics/assessments",
  authenticateAccess,
  requireRole("admin", "supervisor"),
  AnalyticsController.assessments
);
analyticsRouter.get(
  "/analytics/export",
  authenticateAccess,
  requireRole("admin"),
  AnalyticsController.export
);
