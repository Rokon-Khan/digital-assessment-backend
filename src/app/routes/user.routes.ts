import { Router } from "express";
import { authenticateAccess } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { UserController } from "../modules/user/user.controller";

export const userRouter = Router();

userRouter.get("/me", authenticateAccess, UserController.me);
userRouter.put("/me", authenticateAccess, UserController.updateMe);

// Admin
userRouter.get(
  "/admin/users",
  authenticateAccess,
  requireRole("admin"),
  UserController.listUsers
);
userRouter.get(
  "/admin/users/:id",
  authenticateAccess,
  requireRole("admin"),
  UserController.getUser
);
userRouter.delete(
  "/admin/users/:id",
  authenticateAccess,
  requireRole("admin"),
  UserController.deleteUser
);
