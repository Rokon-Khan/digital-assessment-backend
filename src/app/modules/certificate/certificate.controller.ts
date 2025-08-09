import { Request, Response } from "express";
import { sendCertificateEmail } from "../services/emailService.js";
import { UserModel } from "../user/user.model.js";
import { issueCertificate } from "./certificateService.js";

export class CertificateController {
  static async generate(req: Request, res: Response) {
    const user = await UserModel.findById(req.user!.sub);
    if (!user?.currentLevel)
      return res.status(400).json({ error: "No achieved level yet" });
    const cert = await issueCertificate(
      user._id.toString(),
      user.email,
      user.currentLevel
    );
    // Email optional
    void sendCertificateEmail(
      user.email,
      user.currentLevel,
      cert.filePath || ""
    );
    res.json({
      certificate: {
        id: cert._id,
        serial: cert.serialNumber,
        level: cert.level,
      },
    });
  }
}
