import { Router } from "express";
import { authenticateAccess } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { UserController } from "../modules/user/user.controller";

export const userRouter = Router();

userRouter.get("/users/me", authenticateAccess, UserController.me);
userRouter.put("/users/me", authenticateAccess, UserController.updateMe);

// Admin management
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
userRouter.patch(
  "/admin/users/:id/approve-supervisor",
  authenticateAccess,
  requireRole("admin"),
  UserController.approveSupervisor
);
