// import { UserModel } from '../models/User.model.js';
import crypto from "node:crypto";
import { signToken } from "../config/jwt.js";
import { UserModel } from "../user/user.model.js";
import { generateOTP } from "../utils/generateOTP.js";
import { hashPassword } from "../utils/hashPassword.js";
import { verifyPassword } from "../utils/verifyPassword.js";
import { storeOTP } from "./otpService.js";

export async function registerUser(
  email: string,
  password: string,
  role: string | undefined
) {
  const normalized = email.toLowerCase();
  const existing = await UserModel.findOne({ email: normalized });
  if (existing) throw new Error("Email already registered");
  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({
    email: normalized,
    passwordHash,
    role: role ?? "student",
  });
  // OTP
  const otp = generateOTP();
  await storeOTP(
    normalized,
    "email_verification",
    otp,
    Number(process.env.OTP_TTL_SECONDS || 300)
  );
  return { user, otp }; // Return OTP so controller can choose to email or log (never in prod)
}

export async function validatePassword(email: string, password: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("Invalid credentials");
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");
  return user;
}

export function generateAccessToken(user: any) {
  return signToken(
    {
      sub: user._id.toString(),
      role: user.role,
      type: "access",
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
}

export function generateRefreshToken(user: any, overrideVersion?: number) {
  return signToken(
    {
      sub: user._id.toString(),
      role: user.role,
      type: "refresh",
      tokenVersion: overrideVersion ?? user.tokenVersion,
    },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );
}

export async function rotateRefreshToken(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");
  user.tokenVersion += 1;
  await user.save();
  return generateRefreshToken(user);
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
