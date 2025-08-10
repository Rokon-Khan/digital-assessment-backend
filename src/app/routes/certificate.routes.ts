import { Router } from "express";
import { authenticateAccess } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { CertificateController } from "../modules/certificate/certificate.controller";

export const certificateRouter = Router();

certificateRouter.get(
  "/assessment/certificate",
  authenticateAccess,
  requireRole("student"),
  CertificateController.generate
);
