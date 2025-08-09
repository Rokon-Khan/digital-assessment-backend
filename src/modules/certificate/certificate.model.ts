import mongoose, { Schema } from "mongoose";
import { ICertificate } from "../../app/types/interfaces";

const certSchema = new Schema<ICertificate>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    level: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      required: true,
    },
    issuedAt: { type: Date, default: Date.now },
    serialNumber: { type: String, unique: true, index: true },
    filePath: String,
    hash: String,
  },
  { timestamps: true }
);

export const CertificateModel = mongoose.model<ICertificate>(
  "Certificate",
  certSchema
);
