import mysql from "mysql2/promise";
import { env } from "./env";

// Un solo "pool" de conexiones para toda la API.
export const db = mysql.createPool({
  uri: env.DATABASE_URL,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

export async function checkDbConnection() {
  const conn = await db.getConnection();
  await conn.ping();
  conn.release();
}
