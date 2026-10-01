// ─── ASISTENTE CON INTELIGENCIA ARTIFICIAL ──────────────────────────────────
// POST /api/v1/asistente   body: { mensajes: [{ rol: "usuario"|"asistente", texto }] }
// Responde usando Claude (Anthropic) con toda la información de Family Love.
// Si no hay ANTHROPIC_API_KEY en el .env, responde { modo: "reglas" } y la página
// usa sus respuestas automáticas.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import type { RowDataPacket } from "mysql2";
import { db } from "../../config/db";
import { env } from "../../config/env";
import { validateBody } from "../../middlewares/validate";
import { escucharCambios } from "../../utils/eventos";
import { CONOCIMIENTO_FIJO, INSTRUCCIONES } from "./conocimiento";

const router = Router();

// Máximo 20 mensajes por minuto por persona (evita abusos y gastos)
const limite = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Estás enviando muchos mensajes. Espera un momento, por favor." },
});

const schema = z.object({
  mensajes: z
    .array(
      z.object({
        rol: z.enum(["usuario", "asistente"]),
        texto: z.string().trim().min(1).max(1000),
      })
    )
    .min(1)
    .max(20),
});

// ── Proyectos y noticias actuales (se guardan 5 minutos para no consultar siempre) ──
let cache: { texto: string; hasta: number } | null = null;
escucharCambios(() => {
  cache = null; // si el admin cambia algo, se vuelve a leer
});

async function conocimientoDinamico() {
  if (cache && cache.hasta > Date.now()) return cache.texto;
  try {
    const [proyectos] = await db.execute<RowDataPacket[]>(
      "SELECT titulo, fecha, anio, resumen FROM proyecto ORDER BY anio DESC, id DESC LIMIT 40"
    );
    const [noticias] = await db.execute<RowDataPacket[]>(
      "SELECT id, titulo, fecha, resumen FROM noticia ORDER BY createdAt DESC LIMIT 15"
    );
    const p = proyectos.map((x) => `- ${x.titulo} (${x.fecha || x.anio}): ${x.resumen ?? ""}`).join("\n");
    const n = noticias.map((x) => `- ${x.titulo} (${x.fecha}) → /noticias/${x.id}: ${x.resumen ?? ""}`).join("\n");
    const texto = `## Proyectos realizados (página /proyecto)\n${p || "- (sin proyectos publicados)"}\n\n## Noticias recientes\n${n || "- (sin noticias publicadas)"}`;
    cache = { texto, hasta: Date.now() + 5 * 60 * 1000 };
    return texto;
  } catch (e) {
    console.error("[asistente] no se pudo leer la BD:", e);
    return "";
  }
}

router.post("/", limite, validateBody(schema), async (req, res) => {
  if (!env.ANTHROPIC_API_KEY) {
    return res.json({ modo: "reglas" });
  }

  const { mensajes } = req.body as z.infer<typeof schema>;
  // La conversación debe empezar con el usuario
  const desde = mensajes.findIndex((m) => m.rol === "usuario");
  const historial = mensajes.slice(desde === -1 ? 0 : desde).map((m) => ({
    role: m.rol === "usuario" ? "user" : "assistant",
    content: m.texto,
  }));

  const dinamico = await conocimientoDinamico();
  const fechaHoy = new Date().toLocaleDateString("es-PE", { timeZone: "America/Lima", dateStyle: "full" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.ASISTENTE_MODELO,
        max_tokens: 400,
        system: `${INSTRUCCIONES}\n\nHoy es ${fechaHoy}.\n\n${CONOCIMIENTO_FIJO}\n\n${dinamico}`,
        messages: historial,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!r.ok) {
      console.error("[asistente] error de la IA:", r.status, await r.text());
      return res.json({ modo: "reglas" });
    }
    const data = (await r.json()) as { content?: { type: string; text?: string }[] };
    const texto = (data.content ?? [])
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("")
      .trim();
    if (!texto) return res.json({ modo: "reglas" });
    res.json({ modo: "ia", texto });
  } catch (e) {
    console.error("[asistente] fallo al consultar la IA:", e);
    res.json({ modo: "reglas" });
  }
});

export default router;
