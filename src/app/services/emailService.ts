import { createTransport } from "../config/nodemailer";

const transporter = createTransport();

export async function sendEmailVerification(email: string, otp: string) {
  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Verify your email",
    text: `Your verification OTP is ${otp}`,
    html: `<p>Your verification OTP is <b>${otp}</b></p>`,
  });
}

export async function sendPasswordResetOTP(email: string, otp: string) {
  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Password Reset OTP",
    text: `Your password reset OTP is ${otp}`,
    html: `<p>Your password reset OTP is <b>${otp}</b></p>`,
  });
}

export async function sendCertificateEmail(
  email: string,
  level: string,
  attachmentPath: string
) {
  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Your Digital Competency Certificate",
    text: `Congratulations! You achieved level ${level}. Certificate attached.`,
    attachments: [
      { filename: `certificate-${level}.pdf`, path: attachmentPath },
    ],
  });
}
