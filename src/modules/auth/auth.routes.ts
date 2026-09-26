import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validateBody } from "../../middlewares/validate";
import { requireAuth } from "../../middlewares/auth";
import { HttpError } from "../../utils/http-error";
import * as auth from "./auth.service";
import {
  emailSchema,
  googleSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  tokenSchema,
} from "./auth.schemas";

const router = Router();

// Máximo 20 intentos cada 15 minutos por IP en rutas sensibles.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta de nuevo en unos minutos." },
});

router.post("/register", authLimiter, validateBody(registerSchema), async (req, res) => {
  const session = await auth.register(req.body);
  res.status(201).json(session);
});

router.post("/login", authLimiter, validateBody(loginSchema), async (req, res) => {
  const session = await auth.login(req.body.email, req.body.password);
  res.json(session);
});

router.post("/google", authLimiter, validateBody(googleSchema), async (req, res) => {
  const session = await auth.loginWithGoogle(req.body.idToken);
  res.json(session);
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await auth.findById(req.user!.id);
  if (!user) throw new HttpError(404, "El usuario no existe");
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      image: user.imageUrl ?? null,
      emailVerified: Boolean(user.emailVerified),
    },
  });
});

router.post("/send-verify-email", authLimiter, validateBody(emailSchema), async (req, res) => {
  await auth.sendVerifyEmail(req.body.email);
  res.json({ ok: true, message: "Email enviado correctamente" });
});

router.post("/verify-email", validateBody(tokenSchema), async (req, res) => {
  await auth.verifyEmail(req.body.token);
  res.json({ ok: true });
});

router.post("/forgot-password", authLimiter, validateBody(emailSchema), async (req, res) => {
  await auth.forgotPassword(req.body.email);
  res.json({ ok: true, message: "Email enviado correctamente" });
});

router.post("/validate-reset-token", validateBody(tokenSchema), (req, res) => {
  res.json({ ok: true, ...auth.validateResetToken(req.body.token) });
});

router.post("/reset-password", authLimiter, validateBody(resetPasswordSchema), async (req, res) => {
  await auth.resetPassword(req.body.token, req.body.newPassword);
  res.json({ ok: true, message: "Contraseña actualizada correctamente" });
});

export default router;
