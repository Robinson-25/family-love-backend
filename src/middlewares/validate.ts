import type { NextFunction, Request, Response } from "express";
import { z, type ZodType } from "zod";
import { HttpError } from "../utils/http-error";

// Mensajes de error de validación en español.
z.config(z.locales.es());

// Valida req.body con un esquema de Zod. Si falla, responde 400 con el detalle.
export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        campo: i.path.join("."),
        mensaje: i.message,
      }));
      throw new HttpError(400, details[0]?.mensaje ?? "Datos inválidos", details);
    }
    req.body = result.data;
    next();
  };
}
