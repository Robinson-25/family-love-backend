import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { HttpError } from "../utils/http-error";
import { env } from "../config/env";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// Todos los errores terminan aquí. Express 5 captura también los de funciones async.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err instanceof MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "El archivo es demasiado grande" : err.message;
    return res.status(400).json({ error: msg });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "JSON inválido" });
  }

  console.error("[error]", err);
  res.status(500).json({
    error: "Error interno del servidor",
    ...(env.isProd ? {} : { debug: String(err) }),
  });
}
