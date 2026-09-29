import { Router } from "express";
import { z } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../../config/db";
import { requireStaff } from "../../middlewares/auth";
import { validateBody } from "../../middlewares/validate";
import { HttpError } from "../../utils/http-error";
import { avisarCambio } from "../../utils/eventos";

const router = Router();

// Una imagen o video puede ser un enlace (https://...) o una ruta del sitio (/images/...)
const esMedia = (v: string) => /^https?:\/\//i.test(v) || v.startsWith("/");
const mediaRequerida = (campo: string) =>
  z
    .string()
    .trim()
    .min(1, `${campo} es obligatoria`)
    .max(500)
    .refine(esMedia, `${campo} debe ser un enlace (https://...) o una ruta (/images/...)`);
const mediaOpcional = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || esMedia(v), "El video debe ser un enlace (https://...) o una ruta (/videos/...)")
  .nullish();

const noticiaSchema = z.object({
  titulo: z.string().trim().min(1, "El título es obligatorio").max(255),
  resumen: z.string().trim().min(1, "El resumen es obligatorio"),
  contenido: z.string().trim().min(1, "El contenido es obligatorio"),
  imagen: mediaRequerida("La imagen"),
  video: mediaOpcional,
  fecha: z.string().trim().min(1, "La fecha es obligatoria").max(50),
});

// GET /api/v1/noticias  (público)
router.get("/", async (_req, res) => {
  const [rows] = await db.execute("SELECT * FROM noticia ORDER BY createdAt DESC");
  res.json({ noticias: rows });
});

// GET /api/v1/noticias/:id  (público)
router.get("/:id", async (req, res) => {
  const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM noticia WHERE id = ?", [
    req.params.id,
  ]);
  if (!rows[0]) throw new HttpError(404, "Noticia no encontrada");
  res.json({ noticia: rows[0] });
});

// POST /api/v1/noticias  (admin / colaborador)
router.post("/", requireStaff, validateBody(noticiaSchema), async (req, res) => {
  const { titulo, resumen, contenido, imagen, video, fecha } = req.body;
  const [result] = await db.execute<ResultSetHeader>(
    "INSERT INTO noticia (titulo, resumen, contenido, imagen, video, fecha) VALUES (?, ?, ?, ?, ?, ?)",
    [titulo, resumen, contenido, imagen, video || null, fecha]
  );
  avisarCambio("noticias"); // → el sitio público se actualiza solo
  res.status(201).json({ ok: true, id: result.insertId });
});

// PUT /api/v1/noticias/:id  (admin / colaborador)
router.put("/:id", requireStaff, validateBody(noticiaSchema), async (req, res) => {
  const { titulo, resumen, contenido, imagen, video, fecha } = req.body;
  const [result] = await db.execute<ResultSetHeader>(
    "UPDATE noticia SET titulo=?, resumen=?, contenido=?, imagen=?, video=?, fecha=? WHERE id = ?",
    [titulo, resumen, contenido, imagen, video || null, fecha, req.params.id]
  );
  if (result.affectedRows === 0) throw new HttpError(404, "Noticia no encontrada");
  avisarCambio("noticias");
  res.json({ ok: true });
});

// DELETE /api/v1/noticias/:id  (admin / colaborador)
router.delete("/:id", requireStaff, async (req, res) => {
  const [result] = await db.execute<ResultSetHeader>("DELETE FROM noticia WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0) throw new HttpError(404, "Noticia no encontrada");
  avisarCambio("noticias");
  res.json({ ok: true });
});

export default router;
