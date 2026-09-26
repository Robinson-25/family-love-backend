import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Correo inválido");
const password = z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100);

export const registerSchema = z.object({
  username: z.string().trim().min(2, "El usuario debe tener al menos 2 caracteres").max(50),
  email,
  password,
  // Nota: el rol NO se acepta desde el cliente. Todos se registran como "customer".
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const googleSchema = z.object({
  idToken: z.string().min(10, "Falta el token de Google"),
});

export const emailSchema = z.object({ email });

export const tokenSchema = z.object({
  token: z.string().min(10, "Token inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token inválido"),
  newPassword: password,
});
