import mongoose, { Schema } from "mongoose";

const otpLogSchema = new Schema(
  {
    email: { type: String, index: true },
    purpose: { type: String },
    sentAt: { type: Date, default: Date.now },
    ip: String,
    success: Boolean,
  },
  { timestamps: true }
);

export const OTPLogModel = mongoose.model("OTPLog", otpLogSchema);
