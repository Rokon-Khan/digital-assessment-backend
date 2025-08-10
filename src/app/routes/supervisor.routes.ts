import { Router } from "express";
import { authenticateAccess } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { SupervisorController } from "../modules/supervisor/supervisor.controller";

export const supervisorRouter = Router();

supervisorRouter.get(
  "/supervisor/monitor/:userId",
  authenticateAccess,
  requireRole("supervisor", "admin"),
  SupervisorController.monitor
);

supervisorRouter.post(
  "/supervisor/invalidate/:userId",
  authenticateAccess,
  requireRole("supervisor", "admin"),
  SupervisorController.invalidate
);
