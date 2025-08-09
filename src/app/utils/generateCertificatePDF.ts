import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";

interface CertificateOptions {
  userEmail: string;
  level: string;
  serialNumber: string;
  issuer: string;
}

export async function generateCertificatePDF(
  opts: CertificateOptions
): Promise<{ filePath: string; hash: string }> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([600, 400]);

  page.drawText("Digital Competency Certificate", {
    x: 60,
    y: 330,
    size: 20,
    font,
  });
  page.drawText(`Awarded To: ${opts.userEmail}`, {
    x: 60,
    y: 280,
    size: 14,
    font,
  });
  page.drawText(`Level: ${opts.level}`, { x: 60, y: 250, size: 14, font });
  page.drawText(`Serial: ${opts.serialNumber}`, { x: 60, y: 220, size: 12 });
  page.drawText(`Issuer: ${opts.issuer}`, { x: 60, y: 190, size: 12 });
  page.drawText(`Issued: ${new Date().toISOString()}`, {
    x: 60,
    y: 160,
    size: 10,
  });

  const bytes = await pdf.save();
  const hash = crypto.createHash("sha256").update(bytes).digest("hex");

  const certificatesDir = path.join(process.cwd(), "certificates");
  if (!fs.existsSync(certificatesDir)) fs.mkdirSync(certificatesDir);
  const filePath = path.join(certificatesDir, `${opts.serialNumber}.pdf`);
  fs.writeFileSync(filePath, bytes);
  return { filePath, hash };
}
