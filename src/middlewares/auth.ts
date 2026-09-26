import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error";
import { verifyToken, type Role } from "../utils/tokens";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: number; role: Role };
    }
  }
}

// Exige un token válido en la cabecera:  Authorization: Bearer <token>
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    throw new HttpError(401, "No autorizado");
  }
  const payload = verifyToken(token, "access");
  req.user = { id: Number(payload.sub), role: payload.role ?? "customer" };
  next();
}

// Exige además uno de los roles indicados.
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      if (!req.user || !roles.includes(req.user.role)) {
        throw new HttpError(403, "No tienes permiso para esta acción");
      }
      next();
    });
  };
}

// Quienes pueden gestionar contenido (lo mismo que hacía el proyecto original).
export const requireStaff = requireRole("admin", "colaborator");
