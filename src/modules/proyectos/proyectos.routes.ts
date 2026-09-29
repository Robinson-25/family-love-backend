import { Router } from "express";
import { z } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../../config/db";
import { requireStaff } from "../../middlewares/auth";
import { validateBody } from "../../middlewares/validate";
import { HttpError } from "../../utils/http-error";

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

const COLORES = [
  "from-orange-400 to-rose-500",
  "from-pink-400 to-purple-500",
  "from-purple-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-yellow-400 to-orange-500",
  "from-blue-500 to-cyan-500",
  "from-[#1a3a6b] to-[#2251a3]",
];
const colorAleatorio = () => COLORES[Math.floor(Math.random() * COLORES.length)];

const proyectoSchema = z.object({
  titulo: z.string().trim().min(1, "El título es obligatorio").max(255),
  fecha: z.string().trim().min(1, "La fecha es obligatoria").max(50),
  anio: z.coerce.number().int().min(2000, "Año inválido").max(2100, "Año inválido"),
  resumen: z.string().trim().min(1, "El resumen es obligatorio"),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria"),
  imagen: mediaRequerida("La imagen principal"),
  fotos: z.array(mediaRequerida("Cada foto")).optional(),
  video: mediaOpcional,
  etiqueta: z.string().trim().min(1, "La etiqueta es obligatoria").max(100),
  emoji: z.string().max(10).optional(),
});

function parseFotos(row: RowDataPacket) {
  let fotos: string[] = [];
  try {
    fotos = row.fotos ? JSON.parse(row.fotos) : [];
  } catch {
    fotos = [];
  }
  return { ...row, fotos };
}

// GET /api/v1/proyectos?anio=2025  (público)
router.get("/", async (req, res) => {
  const anio = typeof req.query.anio === "string" ? req.query.anio : undefined;
  const [rows] = anio
    ? await db.execute<RowDataPacket[]>(
        "SELECT * FROM proyecto WHERE anio = ? ORDER BY createdAt DESC",
        [anio]
      )
    : await db.execute<RowDataPacket[]>(
        "SELECT * FROM proyecto ORDER BY anio DESC, createdAt DESC"
      );
  res.json({ proyectos: rows.map(parseFotos) });
});

// GET /api/v1/proyectos/:id  (público)
router.get("/:id", async (req, res) => {
  const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM proyecto WHERE id = ?", [
    req.params.id,
  ]);
  if (!rows[0]) throw new HttpError(404, "Proyecto no encontrado");
  res.json({ proyecto: parseFotos(rows[0]) });
});

// POST /api/v1/proyectos  (admin / colaborador)
router.post("/", requireStaff, validateBody(proyectoSchema), async (req, res) => {
  const p = req.body as z.infer<typeof proyectoSchema>;
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO proyecto (titulo, fecha, anio, resumen, descripcion, imagen, fotos, video, etiqueta, color, emoji)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      p.titulo,
      p.fecha,
      p.anio,
      p.resumen,
      p.descripcion,
      p.imagen,
      JSON.stringify(p.fotos?.length ? p.fotos : [p.imagen]),
      p.video || null,
      p.etiqueta,
      colorAleatorio(),
      p.emoji || "💙",
    ]
  );
  res.status(201).json({ ok: true, id: result.insertId });
});

// PUT /api/v1/proyectos/:id  (admin / colaborador)
router.put("/:id", requireStaff, validateBody(proyectoSchema), async (req, res) => {
  const p = req.body as z.infer<typeof proyectoSchema>;
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE proyecto SET titulo=?, fecha=?, anio=?, resumen=?, descripcion=?, imagen=?, fotos=?, video=?, etiqueta=?, emoji=?
     WHERE id = ?`,
    [
      p.titulo,
      p.fecha,
      p.anio,
      p.resumen,
      p.descripcion,
      p.imagen,
      JSON.stringify(p.fotos?.length ? p.fotos : [p.imagen]),
      p.video || null,
      p.etiqueta,
      p.emoji || "💙",
      req.params.id,
    ]
  );
  if (result.affectedRows === 0) throw new HttpError(404, "Proyecto no encontrado");
  res.json({ ok: true });
});

// DELETE /api/v1/proyectos/:id  (admin / colaborador)
router.delete("/:id", requireStaff, async (req, res) => {
  const [result] = await db.execute<ResultSetHeader>("DELETE FROM proyecto WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0) throw new HttpError(404, "Proyecto no encontrado");
  res.json({ ok: true });
});

export default router;