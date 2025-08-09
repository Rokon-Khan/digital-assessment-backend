import { nanoid } from "nanoid";
import { generateCertificatePDF } from "../../utils/generateCertificatePDF";
import { CertificateModel } from "./certificate.model";

export async function issueCertificate(
  userId: string,
  email: string,
  level: string
) {
  // Avoid duplicates at same level
  const existing = await CertificateModel.findOne({ user: userId, level });
  if (existing) return existing;

  const serial = `CERT-${Date.now()}-${nanoid(6).toUpperCase()}`;
  const { filePath, hash } = await generateCertificatePDF({
    userEmail: email,
    level,
    serialNumber: serial,
    issuer: process.env.CERTIFICATE_ISSUER || "Test_School",
  });

  return CertificateModel.create({
    user: userId,
    level,
    serialNumber: serial,
    filePath,
    hash,
  });
}
