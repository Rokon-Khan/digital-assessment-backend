import mongoose, { Schema } from "mongoose";
import { IUser } from "../../types/interfaces";

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "student", "supervisor"],
      default: "student",
      index: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    supervisorApproved: { type: Boolean, default: false },
    studentApproved: { type: Boolean, default: true }, // always true for students
    otpVersion: { type: Number, default: 0 },
    tokenVersion: { type: Number, default: 0 },
    currentLevel: { type: String, enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
    refreshTokens: [{ type: String }],
    profile: {
      name: { type: String, required: true },
      avatarUrl: String,
      phone: String,
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
