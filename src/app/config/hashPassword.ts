import bcrypt from "bcrypt";

const ROUNDS = 12;

export async function hashPassword(raw: string): Promise<string> {
  return bcrypt.hash(raw, ROUNDS);
}
