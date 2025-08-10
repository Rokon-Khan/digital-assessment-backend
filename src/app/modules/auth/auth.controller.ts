// import { Request, Response } from "express";
// import { hashPassword } from "../../config/hashPassword";
// import {
//   sendEmailVerification,
//   sendPasswordResetOTP,
// } from "../../services/emailService";
// import { generateOTP } from "../../utils/generateOTP";
// import {
//   loginSchema,
//   otpSchema,
//   registerSchema,
//   resendOtpSchema,
//   resetPasswordSchema,
// } from "../../validators/auth.validator";
// import { storeOTP, verifyOTP } from "../otp/otpService";
// import { UserModel } from "../user/user.model";

// import {
//   generateAccessToken,
//   generateRefreshToken,
//   registerUser,
//   rotateRefreshToken,
//   validatePassword,
// } from "./authService";

// export class AuthController {
//   static async register(req: Request, res: Response) {
//     const parsed = registerSchema.parse(req.body);
//     const { user, otp } = await registerUser(
//       parsed.email,
//       parsed.password,
//       parsed.role
//     );
//     await sendEmailVerification(user.email, otp);
//     res
//       .status(201)
//       .json({ message: "Registered. OTP sent.", userId: user._id });
//   }

//   static async verifyEmail(req: Request, res: Response) {
//     const { email, otp } = otpSchema.parse(req.body);
//     const ok = await verifyOTP(email, "email_verification", otp);
//     if (!ok) return res.status(400).json({ error: "Invalid or expired OTP" });
//     await UserModel.updateOne(
//       { email: email.toLowerCase() },
//       { isEmailVerified: true }
//     );
//     res.json({ message: "Email verified" });
//   }

//   static async resendOtp(req: Request, res: Response) {
//     const { email } = resendOtpSchema.parse(req.body);
//     const otp = generateOTP();
//     await storeOTP(
//       email,
//       "email_verification",
//       otp,
//       Number(process.env.OTP_TTL_SECONDS || 300)
//     );
//     await sendEmailVerification(email, otp);
//     res.json({ message: "OTP resent" });
//   }

//   static async login(req: Request, res: Response) {
//     const { email, password } = loginSchema.parse(req.body);
//     const user = await validatePassword(email, password);
//     if (!user.isEmailVerified)
//       return res.status(403).json({ error: "Email not verified" });
//     const accessToken = generateAccessToken(user);
//     const refreshToken = generateRefreshToken(user);
//     res.json({ accessToken, refreshToken });
//   }

//   static async refreshToken(req: Request, res: Response) {
//     // Expect refresh token in Authorization header or body
//     const token = req.body.refreshToken || req.headers["x-refresh-token"];
//     if (!token) return res.status(401).json({ error: "Missing refresh token" });
//     // Verify manually
//     const jwt = await import("jsonwebtoken");
//     try {
//       const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
//       if (payload.type !== "refresh") throw new Error("Invalid");
//       const user = await UserModel.findById(payload.sub);
//       if (!user || user.tokenVersion !== payload.tokenVersion) {
//         return res.status(401).json({ error: "Invalid refresh token" });
//       }
//       // Rotate
//       const newRefresh = await rotateRefreshToken(user._id.toString());
//       const access = generateAccessToken(user);
//       res.json({ accessToken: access, refreshToken: newRefresh });
//     } catch {
//       res.status(401).json({ error: "Invalid or expired token" });
//     }
//   }

//   static async logout(_req: Request, res: Response) {
//     // If storing refresh blacklist in Redis, add here. (TODO)
//     res.json({ message: "Logged out (client should discard tokens)" });
//   }

//   static async forgotPassword(req: Request, res: Response) {
//     const { email } = resendOtpSchema.parse(req.body);
//     const user = await UserModel.findOne({ email: email.toLowerCase() });
//     if (!user) return res.json({ message: "If account exists OTP sent" });
//     const otp = generateOTP();
//     await storeOTP(
//       email,
//       "password_reset",
//       otp,
//       Number(process.env.OTP_TTL_SECONDS || 300)
//     );
//     await sendPasswordResetOTP(email, otp);
//     res.json({ message: "OTP sent" });
//   }

//   static async resetPassword(req: Request, res: Response) {
//     const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);
//     const ok = await verifyOTP(email, "password_reset", otp);
//     if (!ok) return res.status(400).json({ error: "Invalid or expired OTP" });
//     const hash = await hashPassword(newPassword);
//     await UserModel.updateOne(
//       { email: email.toLowerCase() },
//       { passwordHash: hash, tokenVersion: Date.now() }
//     ); // Invalidate tokens
//     res.json({ message: "Password updated" });
//   }
// }

import { Request, Response } from "express";
import { hashPassword } from "../../config/hashPassword";
import {
  sendEmailVerification,
  sendPasswordResetOTP,
} from "../../services/emailService";
import { generateOTP } from "../../utils/generateOTP";
import {
  loginSchema,
  otpSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
} from "../../validators/auth.validator";
import { storeOTP, verifyOTP } from "../otp/otpService";
import { UserModel } from "../user/user.model";

import {
  generateAccessToken,
  generateRefreshToken,
  registerUser,
  rotateRefreshToken,
  validatePassword,
} from "./authService";

export class AuthController {
  static async register(req: Request, res: Response) {
    const parsed = registerSchema.parse(req.body);
    // Safety: ensure no 'admin'
    if ((parsed.role as string) === "admin") {
      return res.status(400).json({ error: "Cannot self-register as admin" });
    }

    const { user, otp } = await registerUser({
      email: parsed.email,
      password: parsed.password,
      role: parsed.role,
      profile: parsed.profile,
    });
    await sendEmailVerification(user.email, otp);
    res.status(201).json({
      message: "Registered. OTP sent.",
      userId: user._id,
      supervisorApprovalRequired: user.role === "supervisor",
    });
  }

  static async verifyEmail(req: Request, res: Response) {
    const { email, otp } = otpSchema.parse(req.body);
    const ok = await verifyOTP(email, "email_verification", otp);
    if (!ok) return res.status(400).json({ error: "Invalid or expired OTP" });
    await UserModel.updateOne(
      { email: email.toLowerCase() },
      { isEmailVerified: true }
    );
    res.json({ message: "Email verified" });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body);
    const user = await validatePassword(email, password);
    if (!user.isEmailVerified)
      return res.status(403).json({ error: "Email not verified" });

    // If supervisor and not approved, still allow login but restrict privileged endpoints.
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.json({
      accessToken,
      refreshToken,
      role: user.role,
      supervisorApproved:
        user.role === "supervisor" ? !!user.supervisorApproved : undefined,
    });
  }

  // (Other existing methods unchanged)
  static async resendOtp(req: Request, res: Response) {
    const { email } = resendOtpSchema.parse(req.body);
    const otp = generateOTP();
    await storeOTP(
      email,
      "email_verification",
      otp,
      Number(process.env.OTP_TTL_SECONDS || 300)
    );
    await sendEmailVerification(email, otp);
    res.json({ message: "OTP resent" });
  }

  static async refreshToken(req: Request, res: Response) {
    const token = req.body.refreshToken || req.headers["x-refresh-token"];
    if (!token) return res.status(401).json({ error: "Missing refresh token" });
    const jwt = await import("jsonwebtoken");
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
      if (payload.type !== "refresh") throw new Error("Invalid");
      const user = await UserModel.findById(payload.sub);
      if (!user || user.tokenVersion !== payload.tokenVersion) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }
      const newRefresh = await rotateRefreshToken(user._id.toString());
      const access = generateAccessToken(user);
      res.json({ accessToken: access, refreshToken: newRefresh });
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = resendOtpSchema.parse(req.body);
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ message: "If account exists OTP sent" });
    const otp = generateOTP();
    await storeOTP(
      email,
      "password_reset",
      otp,
      Number(process.env.OTP_TTL_SECONDS || 300)
    );
    await sendPasswordResetOTP(email, otp);
    res.json({ message: "OTP sent" });
  }

  static async resetPassword(req: Request, res: Response) {
    const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);
    const ok = await verifyOTP(email, "password_reset", otp);
    if (!ok) return res.status(400).json({ error: "Invalid or expired OTP" });
    const hash = await hashPassword(newPassword);
    await UserModel.updateOne(
      { email: email.toLowerCase() },
      { passwordHash: hash, tokenVersion: Date.now() }
    );
    res.json({ message: "Password updated" });
  }

  static async logout(_req: Request, res: Response) {
    res.json({ message: "Logged out" });
  }
}
