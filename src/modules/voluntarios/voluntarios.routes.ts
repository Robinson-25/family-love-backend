import { Router } from "express";
import { z } from "zod";
import { db } from "../../config/db";
import { env } from "../../config/env";
import { sendMail } from "../../config/mailer";
import { requireAuth, requireStaff } from "../../middlewares/auth";
import { validateBody } from "../../middlewares/validate";
import { escapeHtml } from "../../utils/escape-html";

const router = Router();

const voluntarioSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(191),
  edad: z.coerce.number().int().min(10, "Edad inválida").max(100, "Edad inválida"),
  email: z.string().trim().email("Correo inválido").max(191),
  telefono: z.string().trim().min(6, "Teléfono inválido").max(30),
  motivacion: z.string().trim().max(191).optional().default(""),
});

// POST /api/v1/voluntarios  (usuario con sesión iniciada)
router.post("/", requireAuth, validateBody(voluntarioSchema), async (req, res) => {
  const v = req.body as z.infer<typeof voluntarioSchema>;

  await db.execute(
    "INSERT INTO voluntario (nombre, edad, email, telefono, motivacion) VALUES (?, ?, ?, ?, ?)",
    [v.nombre, v.edad, v.email, v.telefono, v.motivacion]
  );

  // Si el correo falla, el registro ya quedó guardado; no rompemos la respuesta.
  sendMail({
    to: env.CONTACT_EMAIL,
    subject: `🌟 Nuevo voluntario: ${v.nombre}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a3a6b, #2251a3); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">¡Nuevo Voluntario! 🎉</h1>
          <p style="color: rgba(255,255,255,0.8);">Family Love ha recibido una nueva solicitud</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 12px 0; font-weight: bold;">👤 Nombre</td><td>${escapeHtml(v.nombre)}</td></tr>
            <tr><td style="padding: 12px 0; font-weight: bold;">🎂 Edad</td><td>${v.edad} años</td></tr>
            <tr><td style="padding: 12px 0; font-weight: bold;">📧 Correo</td><td>${escapeHtml(v.email)}</td></tr>
            <tr><td style="padding: 12px 0; font-weight: bold;">📱 Teléfono</td><td>${escapeHtml(v.telefono)}</td></tr>
            <tr><td style="padding: 12px 0; font-weight: bold;">💬 Motivación</td><td>${escapeHtml(v.motivacion || "No especificó")}</td></tr>
          </table>
        </div>
      </div>`,
  }).catch((e) => console.error("[voluntarios] correo no enviado:", e));

  res.status(201).json({ success: true });
});

// GET /api/v1/voluntarios  (admin / colaborador) — NUEVO: para verlos en el panel
router.get("/", requireStaff, async (_req, res) => {
  const [rows] = await db.execute("SELECT * FROM voluntario ORDER BY createdAt DESC");
  res.json({ voluntarios: rows });
});

export default router;
