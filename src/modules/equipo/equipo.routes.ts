// ─── EQUIPO DIRECTIVO ────────────────────────────────────────────────────────
// Las personas que aparecen en "Quiénes Somos → Nuestro Equipo Directivo".
// Se administran desde el panel (agregar, editar, ordenar y eliminar).
//
//   GET    /api/v1/equipo            lista en orden (público)
//   GET    /api/v1/equipo/:id        una persona (público)
//   POST   /api/v1/equipo            agregar            (admin / colaborador)
//   PUT    /api/v1/equipo/:id        editar             (admin / colaborador)
//   POST   /api/v1/equipo/:id/mover  subir o bajar      (admin / colaborador)
//   DELETE /api/v1/equipo/:id        eliminar           (admin / colaborador)
import { Router } from "express";
import { z } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../../config/db";
import { requireStaff } from "../../middlewares/auth";
import { validateBody } from "../../middlewares/validate";
import { HttpError } from "../../utils/http-error";
import { avisarCambio } from "../../utils/eventos";
import { EQUIPO_INICIAL } from "./equipo.seed";

const router = Router();

// ── La tabla se crea sola la primera vez (no hay que tocar la base de datos) ──
let tablaLista: Promise<void> | null = null;

export function asegurarTablaEquipo() {
  if (!tablaLista) {
    tablaLista = (async () => {
      await db.query(`
        CREATE TABLE IF NOT EXISTS equipo (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(120) NOT NULL,
          cargo VARCHAR(160) NOT NULL,
          imagen VARCHAR(500) NOT NULL,
          bio TEXT NOT NULL,
          orden INT NOT NULL DEFAULT 0,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      const [filas] = await db.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM equipo");
      if (Number(filas[0].total) === 0) {
        // Primera vez: se cargan las personas que ya estaban en la página
        for (const [i, p] of EQUIPO_INICIAL.entries()) {
          await db.execute(
            "INSERT INTO equipo (nombre, cargo, imagen, bio, orden) VALUES (?, ?, ?, ?, ?)",
            [p.nombre, p.cargo, p.imagen, p.bio, i + 1]
          );
        }
        console.log(`[equipo] Tabla creada con ${EQUIPO_INICIAL.length} personas iniciales`);
      }
    })().catch((e) => {
      tablaLista = null; // si falló (por ejemplo, sin conexión), se reintenta luego
      throw e;
    });
  }
  return tablaLista;
}

router.use(async (_req, _res, next) => {
  await asegurarTablaEquipo();
  next();
});

// La foto puede ser un enlace (https://...) o una ruta del sitio (/images/...)
const esMedia = (v: string) => /^https?:\/\//i.test(v) || v.startsWith("/");

const equipoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  cargo: z.string().trim().min(1, "El cargo es obligatorio").max(160),
  imagen: z
    .string()
    .trim()
    .min(1, "La foto es obligatoria")
    .max(500)
    .refine(esMedia, "La foto debe ser un enlace (https://...) o una ruta (/images/...)"),
  bio: z.string().trim().min(1, "La biografía es obligatoria").max(2000, "La biografía es muy larga (máximo 2000 letras)"),
});

const moverSchema = z.object({ direccion: z.enum(["arriba", "abajo"]) });

const ORDEN = "ORDER BY orden ASC, id ASC";

// GET /api/v1/equipo  (público)
router.get("/", async (_req, res) => {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT id, nombre, cargo, imagen, bio, orden FROM equipo ${ORDEN}`
  );
  res.json({ equipo: rows });
});

// GET /api/v1/equipo/:id  (público)
router.get("/:id", async (req, res) => {
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT id, nombre, cargo, imagen, bio, orden FROM equipo WHERE id = ?",
    [req.params.id]
  );
  if (!rows[0]) throw new HttpError(404, "Persona no encontrada");
  res.json({ persona: rows[0] });
});

// POST /api/v1/equipo  (admin / colaborador) → se agrega al final
router.post("/", requireStaff, validateBody(equipoSchema), async (req, res) => {
  const p = req.body as z.infer<typeof equipoSchema>;
  const [max] = await db.execute<RowDataPacket[]>("SELECT COALESCE(MAX(orden), 0) AS ultimo FROM equipo");
  const [result] = await db.execute<ResultSetHeader>(
    "INSERT INTO equipo (nombre, cargo, imagen, bio, orden) VALUES (?, ?, ?, ?, ?)",
    [p.nombre, p.cargo, p.imagen, p.bio, Number(max[0].ultimo) + 1]
  );
  avisarCambio("equipo"); // → el sitio público se actualiza solo
  res.status(201).json({ ok: true, id: result.insertId });
});

// PUT /api/v1/equipo/:id  (admin / colaborador)
router.put("/:id", requireStaff, validateBody(equipoSchema), async (req, res) => {
  const p = req.body as z.infer<typeof equipoSchema>;
  const [result] = await db.execute<ResultSetHeader>(
    "UPDATE equipo SET nombre = ?, cargo = ?, imagen = ?, bio = ? WHERE id = ?",
    [p.nombre, p.cargo, p.imagen, p.bio, req.params.id]
  );
  if (result.affectedRows === 0) throw new HttpError(404, "Persona no encontrada");
  avisarCambio("equipo");
  res.json({ ok: true });
});

// POST /api/v1/equipo/:id/mover  { direccion: "arriba" | "abajo" }
// Cambia de lugar con la persona de al lado.
router.post("/:id/mover", requireStaff, validateBody(moverSchema), async (req, res) => {
  const { direccion } = req.body as z.infer<typeof moverSchema>;
  const [rows] = await db.execute<RowDataPacket[]>(`SELECT id FROM equipo ${ORDEN}`);
  const ids = rows.map((r) => Number(r.id));
  const i = ids.indexOf(Number(req.params.id));
  if (i === -1) throw new HttpError(404, "Persona no encontrada");
  const j = direccion === "arriba" ? i - 1 : i + 1;
  if (j >= 0 && j < ids.length) {
    [ids[i], ids[j]] = [ids[j], ids[i]];
    // Se renumera toda la lista para que el orden quede siempre limpio (1, 2, 3…)
    for (const [posicion, id] of ids.entries()) {
      await db.execute("UPDATE equipo SET orden = ? WHERE id = ?", [posicion + 1, id]);
    }
    avisarCambio("equipo");
  }
  res.json({ ok: true });
});

// DELETE /api/v1/equipo/:id  (admin / colaborador)
router.delete("/:id", requireStaff, async (req, res) => {
  const [result] = await db.execute<ResultSetHeader>("DELETE FROM equipo WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0) throw new HttpError(404, "Persona no encontrada");
  avisarCambio("equipo");
  res.json({ ok: true });
});

export default router;
