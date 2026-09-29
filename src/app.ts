import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { HttpError } from "./utils/http-error";
import { errorHandler, notFound } from "./middlewares/error-handler";
import authRoutes from "./modules/auth/auth.routes";
import noticiasRoutes from "./modules/noticias/noticias.routes";
import proyectosRoutes from "./modules/proyectos/proyectos.routes";
import voluntariosRoutes from "./modules/voluntarios/voluntarios.routes";
import contactoRoutes from "./modules/contacto/contacto.routes";
import uploadsRoutes from "./modules/uploads/uploads.routes";
import statsRoutes from "./modules/stats/stats.routes";
import eventosRoutes from "./modules/eventos/eventos.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1); // necesario detrás de Render/Railway/Clever Cloud
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        // Permite herramientas sin origin (Postman, curl) y los dominios configurados.
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        cb(new HttpError(403, `Origen no permitido por CORS: ${origin}`));
      },
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.isProd ? "combined" : "dev"));

  app.get("/", (_req, res) => res.json({ name: "Family Love API", docs: "/api/v1/health" }));
  app.get("/api/v1/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

  // Todas las rutas de la API, versionadas.
  const api = express.Router();
  api.use("/auth", authRoutes);
  api.use("/noticias", noticiasRoutes);
  api.use("/proyectos", proyectosRoutes);
  api.use("/voluntarios", voluntariosRoutes);
  api.use("/uploads", uploadsRoutes);
  api.use("/stats", statsRoutes);
  api.use("/eventos", eventosRoutes);
  api.use("/", contactoRoutes); // /contacto y /newsletter
  app.use("/api/v1", api);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
