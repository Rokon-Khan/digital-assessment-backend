// import crypto from "node:crypto";
// import { hashPassword } from "../../config/hashPassword";
// import { signToken } from "../../config/jwt";
// import { generateOTP } from "../../utils/generateOTP";
// import { verifyPassword } from "../../utils/verifyPassword";
// import { storeOTP } from "../otp/otpService";
// import { UserModel } from "../user/user.model";

// export async function registerUser(
//   email: string,
//   password: string,
//   role: string | undefined
// ) {
//   const normalized = email.toLowerCase();
//   const existing = await UserModel.findOne({ email: normalized });
//   if (existing) throw new Error("Email already registered");
//   const passwordHash = await hashPassword(password);
//   const user = await UserModel.create({
//     email: normalized,
//     passwordHash,
//     role: role ?? "student",
//   });
//   // OTP
//   const otp = generateOTP();
//   await storeOTP(
//     normalized,
//     "email_verification",
//     otp,
//     Number(process.env.OTP_TTL_SECONDS || 300)
//   );
//   return { user, otp }; // Return OTP so controller can choose to email or log (never in prod)
// }

// export async function validatePassword(email: string, password: string) {
//   const user = await UserModel.findOne({ email: email.toLowerCase() });
//   if (!user) throw new Error("Invalid credentials");
//   const valid = await verifyPassword(password, user.passwordHash);
//   if (!valid) throw new Error("Invalid credentials");
//   return user;
// }

// export function generateAccessToken(user: any) {
//   return signToken(
//     {
//       sub: user._id.toString(),
//       role: user.role,
//       type: "access",
//       tokenVersion: user.tokenVersion,
//     },
//     process.env.JWT_ACCESS_SECRET!,
//     { expiresIn: Number(process.env.JWT_ACCESS_EXPIRES) ?? "1h" }
//   );
// }

// export function generateRefreshToken(user: any, overrideVersion?: number) {
//   return signToken(
//     {
//       sub: user._id.toString(),
//       role: user.role,
//       type: "refresh",
//       tokenVersion: overrideVersion ?? user.tokenVersion,
//     },
//     process.env.JWT_REFRESH_SECRET!,
//     { expiresIn: Number(process.env.JWT_REFRESH_EXPIRES) ?? "1d" }
//   );
// }

// export async function rotateRefreshToken(userId: string) {
//   const user = await UserModel.findById(userId);
//   if (!user) throw new Error("User not found");
//   user.tokenVersion += 1;
//   await user.save();
//   return generateRefreshToken(user);
// }

// export function hashRefreshToken(token: string): string {
//   return crypto.createHash("sha256").update(token).digest("hex");
// }

import { hashPassword } from "../../config/hashPassword";
import { signToken } from "../../config/jwt";
import { generateOTP } from "../../utils/generateOTP";
import { verifyPassword } from "../../utils/verifyPassword";
import { storeOTP } from "../otp/otpService";
import { UserModel } from "../user/user.model";

interface RegisterOptions {
  email: string;
  password: string;
  role: "student" | "supervisor";
  profile: { name: string; avatarUrl?: string; phone?: string };
}

export async function registerUser(opts: RegisterOptions) {
  const email = opts.email.toLowerCase();
  const existing = await UserModel.findOne({ email });
  if (existing) throw new Error("Email already registered");

  // role cannot be admin here (enforced by validation)
  const passwordHash = await hashPassword(opts.password);

  const user = await UserModel.create({
    email,
    passwordHash,
    role: opts.role,
    isEmailVerified: false,
    supervisorApproved: opts.role === "supervisor" ? false : undefined,
    studentApproved: opts.role === "student",
    profile: {
      name: opts.profile.name,
      avatarUrl: opts.profile.avatarUrl,
      phone: opts.profile.phone,
    },
  });

  const otp = generateOTP();
  await storeOTP(
    email,
    "email_verification",
    otp,
    Number(process.env.OTP_TTL_SECONDS || 300)
  );
  return { user, otp };
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
    { expiresIn: Number(process.env.JWT_ACCESS_EXPIRES) || "2h" }
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
    { expiresIn: Number(process.env.JWT_REFRESH_EXPIRES) || "7d" }
  );
}

export async function rotateRefreshToken(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");
  user.tokenVersion += 1;
  await user.save();
  return generateRefreshToken(user);
}
