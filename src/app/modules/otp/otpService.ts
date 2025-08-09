import { getRedis } from "../../config/redis";

function key(email: string, purpose: string) {
  return `otp:${purpose}:${email.toLowerCase()}`;
}

export async function storeOTP(
  email: string,
  purpose: string,
  otp: string,
  ttlSec: number
) {
  const redis = getRedis();
  await redis.set(key(email, purpose), otp, "EX", ttlSec);
}

export async function verifyOTP(
  email: string,
  purpose: string,
  otp: string
): Promise<boolean> {
  const redis = getRedis();
  const stored = await redis.get(key(email, purpose));
  if (!stored) return false;
  const match = stored === otp;
  if (match) await redis.del(key(email, purpose));
  return match;
}

export async function resendAllowed(
  email: string,
  purpose: string
): Promise<boolean> {
  // Could implement rate-limiting logic per purpose.
  return true;
}
