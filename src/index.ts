import { env } from "./config/env";
import { checkDbConnection } from "./config/db";
import { createApp } from "./app";

async function main() {
  try {
    await checkDbConnection();
    console.log("✅ Conectado a MySQL");
  } catch (e) {
    console.error("⚠️  No se pudo conectar a MySQL. Revisa DATABASE_URL.", (e as Error).message);
  }

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`🚀 Family Love API en http://localhost:${env.PORT}/api/v1`);
  });
}

main();
