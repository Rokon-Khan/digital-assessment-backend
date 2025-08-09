import bcrypt from "bcrypt";

export async function verifyPassword(
  raw: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(raw, hash);
}
