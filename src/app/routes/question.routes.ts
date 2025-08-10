import { Router } from "express";
import { authenticateAccess } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { QuestionController } from "../modules/questions/question.controller";

export const questionRouter = Router();

questionRouter.get(
  "/admin/questions",
  authenticateAccess,
  requireRole("admin"),
  QuestionController.list
);
questionRouter.get(
  "/admin/questions/:id",
  authenticateAccess,
  requireRole("admin"),
  QuestionController.get
);
questionRouter.post(
  "/admin/questions",
  authenticateAccess,
  requireRole("admin"),
  QuestionController.create
);
questionRouter.put(
  "/admin/questions/:id",
  authenticateAccess,
  requireRole("admin"),
  QuestionController.update
);
questionRouter.delete(
  "/admin/questions/:id",
  authenticateAccess,
  requireRole("admin"),
  QuestionController.remove
);
questionRouter.post(
  "/admin/questions/bulk",
  authenticateAccess,
  requireRole("admin"),
  QuestionController.bulk
);
