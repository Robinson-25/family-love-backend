// Error con código HTTP. Lánzalo desde cualquier parte:
//   throw new HttpError(404, "Noticia no encontrada")
export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}
