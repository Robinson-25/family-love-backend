import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { db } from "../../config/db";
import { env } from "../../config/env";
import { sendMail } from "../../config/mailer";
import { HttpError } from "../../utils/http-error";
import { escapeHtml } from "../../utils/escape-html";
import { signToken, verifyToken, type Role } from "../../utils/tokens";

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password: string;
  role: Role;
  emailVerified: Date | null;
  imageUrl: string | null;
}

export interface PublicUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  image: string | null;
  emailVerified: boolean;
}

const googleClient = new OAuth2Client();

function toPublic(u: UserRow): PublicUser {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    image: u.imageUrl ?? null,
    emailVerified: Boolean(u.emailVerified),
  };
}

function sessionFor(u: UserRow) {
  const user = toPublic(u);
  const token = signToken({ sub: String(u.id), purpose: "access", role: u.role });
  return { user, token };
}

const SELECT_USER =
  "SELECT u.*, i.url AS imageUrl FROM `user` u LEFT JOIN image i ON i.userId = u.id";

async function findByEmail(email: string) {
  const [rows] = await db.execute<UserRow[]>(`${SELECT_USER} WHERE u.email = ?`, [email]);
  return rows[0] ?? null;
}

export async function findById(id: number | string) {
  const [rows] = await db.execute<UserRow[]>(`${SELECT_USER} WHERE u.id = ?`, [id]);
  return rows[0] ?? null;
}

export async function register(data: { username: string; email: string; password: string }) {
  const [byName] = await db.execute<RowDataPacket[]>(
    "SELECT id FROM `user` WHERE username = ?",
    [data.username]
  );
  if (byName.length) throw new HttpError(409, "Este usuario ya existe");

  if (await findByEmail(data.email)) throw new HttpError(409, "Este correo ya existe");

  const hash = await bcrypt.hash(data.password, 10);
  const [result] = await db.execute<ResultSetHeader>(
    "INSERT INTO `user` (username, email, password, role) VALUES (?, ?, ?, 'customer')",
    [data.username, data.email, hash]
  );
  const user = await findById(result.insertId);
  return sessionFor(user!);
}

export async function login(email: string, password: string) {
  const user = await findByEmail(email);
  if (!user) throw new HttpError(401, "El usuario no existe");
  if (!user.password) {
    throw new HttpError(401, "Esta cuenta usa Google. Inicia sesión con Google.");
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new HttpError(401, "La contraseña es incorrecta");
  return sessionFor(user);
}

// El frontend manda el id_token que le dio Google; aquí lo verificamos de verdad.
export async function loginWithGoogle(idToken: string) {
  if (!env.GOOGLE_CLIENT_ID) throw new HttpError(500, "GOOGLE_CLIENT_ID no configurado");

  const ticket = await googleClient
    .verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID })
    .catch(() => {
      throw new HttpError(401, "Token de Google inválido");
    });
  const payload = ticket.getPayload();
  if (!payload?.email || !payload.email_verified) {
    throw new HttpError(401, "La cuenta de Google no tiene un correo verificado");
  }

  const email = payload.email.toLowerCase();
  let user = await findByEmail(email);

  if (!user) {
    const base = email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 40) || "usuario";
    const [exists] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM `user` WHERE username = ?",
      [base]
    );
    const username = exists.length ? `${base}${Math.floor(Math.random() * 9999)}` : base;

    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO `user` (email, username, emailVerified, password, role) VALUES (?, ?, ?, '', 'customer')",
      [email, username, new Date()]
    );
    user = await findById(result.insertId);
  }

  return sessionFor(user!);
}

export async function sendVerifyEmail(email: string) {
  const user = await findByEmail(email);
  if (!user) throw new HttpError(404, "El usuario no existe");
  if (user.emailVerified) throw new HttpError(400, "La cuenta ya está activada");

  const token = signToken({ sub: String(user.id), purpose: "verify-email" }, "15m");
  const link = `${env.FRONTEND_URL}/register/verify-email/activate-account?at=${token}`;

  await sendMail({
    to: email,
    subject: "Activa tu cuenta de Family Love",
    html: `<div style="font-family:Arial,sans-serif">
      <p>Hola <strong>${escapeHtml(user.username)}</strong>, verifica tu cuenta con el siguiente enlace:</p>
      <p><a href="${link}">Verificar mi correo electrónico</a></p>
      <p style="color:#888;font-size:12px">El enlace vence en 15 minutos.</p>
    </div>`,
  });
}

export async function verifyEmail(token: string) {
  const { sub } = verifyToken(token, "verify-email");
  const user = await findById(sub);
  if (!user) throw new HttpError(404, "El usuario no existe");
  await db.execute("UPDATE `user` SET emailVerified = ? WHERE id = ?", [new Date(), sub]);
}

export async function forgotPassword(email: string) {
  const user = await findByEmail(email);
  if (!user) throw new HttpError(404, "El usuario no existe");

  const token = signToken({ sub: String(user.id), purpose: "reset-password" }, "15m");
  const link = `${env.FRONTEND_URL}/recuperar-contrasena/${token}`;

  await sendMail({
    to: email,
    subject: "Cambia tu contraseña de Family Love",
    html: `<div style="font-family:Arial,sans-serif">
      <p>Hola <strong>${escapeHtml(user.username)}</strong>, puedes cambiar tu contraseña con el siguiente enlace:</p>
      <p><a href="${link}">Cambiar contraseña</a></p>
      <p style="color:#888;font-size:12px">El enlace vence en 15 minutos. Si no lo pediste, ignora este correo.</p>
    </div>`,
  });
}

export function validateResetToken(token: string) {
  const { sub } = verifyToken(token, "reset-password");
  return { userId: sub };
}

// Antes: el cliente mandaba { id, newPassword } y cualquiera podía cambiar
// la contraseña de cualquier usuario. Ahora exige el token del correo.
export async function resetPassword(token: string, newPassword: string) {
  const { sub } = verifyToken(token, "reset-password");
  const hash = await bcrypt.hash(newPassword, 10);
  const [result] = await db.execute<ResultSetHeader>(
    "UPDATE `user` SET password = ? WHERE id = ?",
    [hash, sub]
  );
  if (result.affectedRows === 0) throw new HttpError(404, "El usuario no existe");
}
