import { EventEmitter } from "events";

// "Megáfono" interno del backend: cuando algo cambia, se avisa aquí
// y todos los navegadores conectados a /api/v1/eventos reciben el aviso.
export type Tema = "proyectos" | "noticias" | "equipo";

const bus = new EventEmitter();
bus.setMaxListeners(0); // sin límite de visitantes conectados

export function avisarCambio(tema: Tema) {
  bus.emit("cambio", { tema, at: Date.now() });
}

export function escucharCambios(fn: (data: { tema: Tema; at: number }) => void) {
  bus.on("cambio", fn);
  return () => bus.off("cambio", fn);
}
