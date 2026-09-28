import mysql from "mysql2/promise";
import { env } from "./env";

// Un solo "pool" de conexiones para toda la API.
//
// Las bases de datos gratuitas (como el plan DEV de Clever Cloud) permiten
// MUY POCAS conexiones a la vez y cierran las que quedan inactivas.
// Por eso usamos pocas conexiones, las mantenemos "vivas" y soltamos
// las inactivas antes de que el servidor las corte.
const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: env.DB_POOL_LIMIT,
  maxIdle: 1,
  idleTimeout: 30_000, // suelta conexiones inactivas a los 30 s
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000,
  connectTimeout: 10_000,
});

// Si una conexión vieja fue cortada por el servidor (ECONNRESET, etc.),
// reintentamos UNA vez con una conexión nueva. Solo en consultas de lectura
// (SELECT) para no duplicar datos al guardar.
const ERRORES_DE_CONEXION = new Set([
  "ECONNRESET",
  "PROTOCOL_CONNECTION_LOST",
  "ETIMEDOUT",
  "EPIPE",
  "ECONNREFUSED",
]);

const executeOriginal = pool.execute.bind(pool) as (...args: unknown[]) => Promise<unknown>;

(pool as unknown as { execute: (...args: unknown[]) => Promise<unknown> }).execute = async (
  ...args: unknown[]
) => {
  try {
    return await executeOriginal(...args);
  } catch (error) {
    const code = (error as { code?: string }).code ?? "";
    const sql = String(args[0] ?? "").trim().toUpperCase();
    if (ERRORES_DE_CONEXION.has(code) && sql.startsWith("SELECT")) {
      console.warn(`[db] Conexión perdida (${code}). Reintentando…`);
      return await executeOriginal(...args);
    }
    throw error;
  }
};

export const db = pool;

export async function checkDbConnection() {
  const conn = await db.getConnection();
  await conn.ping();
  conn.release();
}
