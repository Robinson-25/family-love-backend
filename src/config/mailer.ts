import { Resend } from "resend";
import { env } from "./env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendMail(opts: { to: string | string[]; subject: string; html: string }) {
  if (!resend) {
    // En desarrollo sin clave de Resend, mostramos el correo en consola.
    console.warn(`[mail] RESEND_API_KEY vacío. Correo NO enviado → ${opts.subject}`);
    return;
  }
  const { error } = await resend.emails.send({
    from: env.MAIL_FROM,
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.html,
  });
  if (error) throw new Error(`Error enviando correo: ${error.message}`);
}
