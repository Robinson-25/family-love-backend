import "dotenv/config";
import { z } from "zod";

// Valida las variables de entorno al arrancar.
// Si falta algo importante, el servidor no inicia y te dice qué falta.
const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria"),
  DB_SSL: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  // Conexiones simultáneas a MySQL por cada backend que esté corriendo.
  DB_POOL_LIMIT: z.coerce.number().int().min(1).max(20).default(3),

  JWT_SECRET: z.string().min(16, "JWT_SECRET debe tener al menos 16 caracteres"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  GOOGLE_CLIENT_ID: z.string().default(""),

  RESEND_API_KEY: z.string().default(""),
  MAIL_FROM: z.string().default("Family Love <onboarding@resend.dev>"),
  CONTACT_EMAIL: z.string().email().default("familylovevoluntariado@gmail.com"),

  CLOUDINARY_CLOUD_NAME: z.string().default(""),
  CLOUDINARY_API_KEY: z.string().default(""),
  CLOUDINARY_API_SECRET: z.string().default(""),

  // Asistente con IA (opcional). Sin clave, el asistente usa respuestas automáticas.
  ANTHROPIC_API_KEY: z.string().default(""),
  ASISTENTE_MODELO: z.string().default("claude-haiku-4-5-20251001"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variables de entorno inválidas:");
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean),
  isProd: parsed.data.NODE_ENV === "production",
};
