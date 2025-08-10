import { Router } from "express";
import { authenticateAccess } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimit.middleware";
import { AuthController } from "../modules/auth/auth.controller";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, AuthController.register);
authRouter.post("/verify-email", AuthController.verifyEmail);
authRouter.post("/resend-otp", AuthController.resendOtp);
authRouter.post("/login", authRateLimiter, AuthController.login);
authRouter.post("/refresh-token", AuthController.refreshToken);
authRouter.post("/logout", authenticateAccess, AuthController.logout);
authRouter.post("/forgot-password", AuthController.forgotPassword);
authRouter.post("/reset-password", AuthController.resetPassword);
