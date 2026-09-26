import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import { db } from "../../config/db";
import { requireStaff } from "../../middlewares/auth";

const router = Router();

async function contar(tabla: "proyecto" | "noticia" | "voluntario" | "user") {
  const [rows] = await db.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM \`${tabla}\``);
  return Number(rows[0]?.total ?? 0);
}

// GET /api/v1/stats  (admin / colaborador) — números para el inicio del panel
router.get("/", requireStaff, async (_req, res) => {
  const [proyectos, noticias, voluntarios, usuarios] = await Promise.all([
    contar("proyecto"),
    contar("noticia"),
    contar("voluntario"),
    contar("user"),
  ]);
  res.json({ proyectos, noticias, voluntarios, usuarios });
});

export default router;
