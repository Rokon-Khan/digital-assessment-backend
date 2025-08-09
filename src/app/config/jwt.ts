import jwt, { SignOptions } from "jsonwebtoken";

export interface JwtPayloadBase {
  sub: string;
  role: string;
  type: "access" | "refresh";
  tokenVersion?: number;
}

export function signToken<T extends JwtPayloadBase>(
  payload: T,
  secret: string,
  options: SignOptions
): string {
  return jwt.sign(payload, secret, options);
}

export function verifyToken<T extends JwtPayloadBase>(
  token: string,
  secret: string
): T {
  return jwt.verify(token, secret) as T;
}
