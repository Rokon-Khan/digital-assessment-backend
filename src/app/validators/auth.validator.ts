import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  avatarUrl: z.string().url().optional(),
  phone: z.string().min(6).max(20).optional(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student", "supervisor"]).default("student"),
  profile: profileSchema,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const resendOtpSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
});
