import { Router } from "express";
import multer from "multer";
import cloudinary from "../../config/cloudinary";
import { requireStaff } from "../../middlewares/auth";
import { HttpError } from "../../utils/http-error";

const router = Router();

// Archivos en memoria, máximo 50 MB, solo imágenes y videos.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new HttpError(400, "Solo se permiten imágenes o videos"));
    }
  },
});

// POST /api/v1/uploads   (form-data con el campo "file")
router.post("/", requireStaff, upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) throw new HttpError(400, "No se envió ningún archivo");

  const isVideo = file.mimetype.startsWith("video/");

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "family-love/proyectos-noticias",
        resource_type: isVideo ? "video" : "image",
      },
      (error, res) => (error || !res ? reject(error) : resolve(res))
    );
    stream.end(file.buffer);
  }).catch((error: { message?: string; http_code?: number }) => {
    // Mensaje claro en vez de un error 500 genérico
    console.error("[uploads] Cloudinary rechazó el archivo:", error?.message);
    if (/file size too large/i.test(error?.message ?? "")) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      throw new HttpError(400, `El archivo pesa ${mb} MB y supera el máximo permitido. Usa uno más liviano.`);
    }
    throw new HttpError(502, "No se pudo subir el archivo. Intenta de nuevo en un momento.");
  });

  res.status(201).json({ url: result.secure_url, public_id: result.public_id });
});

export default router;
