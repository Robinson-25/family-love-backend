import { z } from "zod";

// Una imagen o video puede ser:
//  - un enlace completo (https://res.cloudinary.com/...)  → subido desde el panel
//  - una ruta de la carpeta public del sitio (/images/..., /videos/...) → fotos antiguas
const esMedia = (v: string) => /^https?:\/\//i.test(v) || v.startsWith("/");

export const mediaRequerida = (campo: string) =>
  z
    .string()
    .trim()
    .min(1, `${campo} es obligatoria`)
    .max(500)
    .refine(esMedia, `${campo} debe ser un enlace (https://...) o una ruta (/images/...)`);

export const mediaOpcional = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || esMedia(v), "El video debe ser un enlace (https://...) o una ruta (/videos/...)")
  .nullish();
  