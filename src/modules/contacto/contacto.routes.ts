import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import type { RowDataPacket } from "mysql2";
import { db } from "../../config/db";
import { env } from "../../config/env";
import { sendMail } from "../../config/mailer";
import { validateBody } from "../../middlewares/validate";
import { escapeHtml } from "../../utils/escape-html";
import { HttpError } from "../../utils/http-error";

const router = Router();

const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  message: { error: "Demasiados envíos. Intenta más tarde." },
});

const contactoSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  cellPhone: z.string().trim().max(30).optional().default(""),
  message: z.string().trim().min(1, "El mensaje es obligatorio").max(3000),
});

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido"),
});

async function emailEnNewsletter(email: string) {
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT id FROM newsletterEmail WHERE email = ?",
    [email]
  );
  return rows.length > 0;
}

// POST /api/v1/contacto
router.post("/contacto", formLimiter, validateBody(contactoSchema), async (req, res) => {
  const { name, email, cellPhone, message } = req.body;

  if (!(await emailEnNewsletter(email))) {
    await db.execute("INSERT INTO newsletterEmail (email) VALUES (?)", [email]);
  }

  await sendMail({
    to: env.CONTACT_EMAIL,
    subject: "Nuevo mensaje desde la web",
    html: `<div style="font-family:Arial,sans-serif">
      <p><strong>Enviado por:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
      <p><strong>Contacto:</strong> ${escapeHtml(cellPhone)}</p>
      <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
    </div>`,
  });

  res.json({ ok: true, message: "Email enviado correctamente" });
});

// POST /api/v1/newsletter
router.post("/newsletter", formLimiter, validateBody(newsletterSchema), async (req, res) => {
  const { email } = req.body;
  if (await emailEnNewsletter(email)) throw new HttpError(409, "Este correo ya existe");
  await db.execute("INSERT INTO newsletterEmail (email) VALUES (?)", [email]);
  res.status(201).json({ ok: true, message: "Email registrado correctamente" });
});

export default router;
