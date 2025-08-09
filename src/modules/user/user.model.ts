import mongoose, { Schema } from "mongoose";
import { IUser } from "../../app/types/interfaces";

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "student", "supervisor"],
      default: "student",
    },
    isEmailVerified: { type: Boolean, default: false },
    otpVersion: { type: Number, default: 0 },
    tokenVersion: { type: Number, default: 0 },
    currentLevel: { type: String, enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
    refreshTokens: [{ type: String }],
    profile: {
      name: String,
      avatarUrl: String,
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
