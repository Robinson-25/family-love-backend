import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "./http-error";

// Cada token tiene un "propósito" para que, por ejemplo,
// un enlace de recuperar contraseña NO sirva como token de sesión.
export type TokenPurpose = "access" | "verify-email" | "reset-password";

export type Role = "customer" | "admin" | "colaborator";

export interface TokenPayload {
  sub: string;
  purpose: TokenPurpose;
  role?: Role;
}

export function signToken(
  payload: TokenPayload,
  expiresIn: SignOptions["expiresIn"] = env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string, purpose: TokenPurpose): TokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    if (payload.purpose !== purpose) throw new Error("purpose");
    return payload;
  } catch {
    throw new HttpError(401, "Token inválido o expirado");
  }
}
