import { Router } from "express";
import { escucharCambios } from "../../utils/eventos";

const router = Router();

// GET /api/v1/eventos  (público)
// Conexión que queda abierta (Server-Sent Events). El backend envía un aviso
// cada vez que se crea, edita o borra un proyecto o una noticia.
router.get("/", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();
  res.write("retry: 3000\n\n"); // si se corta, el navegador reconecta a los 3 s

  const dejarDeEscuchar = escucharCambios((data) => {
    res.write(`event: cambio\ndata: ${JSON.stringify(data)}\n\n`);
  });

  // Un "latido" cada 25 s para que la conexión no se cierre por inactividad.
  const latido = setInterval(() => res.write(": ping\n\n"), 25_000);

  req.on("close", () => {
    clearInterval(latido);
    dejarDeEscuchar();
  });
});

export default router;
