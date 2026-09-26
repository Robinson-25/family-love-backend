# Family Love — Backend (API)

API REST de **Family Love** hecha con **Express 5 + TypeScript + MySQL**.
El sitio público (`family-love-frontend`) y el panel (`family-love-admin`) la usan para leer y guardar datos.

## Requisitos
- Node.js 20 o superior
- Una base de datos MySQL / MariaDB

## Empezar
```bash
npm install
cp .env.example .env      # en Windows: copy .env.example .env
# edita .env con tus datos reales
npm run dev               # http://localhost:4000/api/v1/health
```

### Base de datos
- `database/schema.sql`: crea todas las tablas. Se puede ejecutar varias veces sin borrar nada.
- `database/seed_proyectos.sql`: datos de ejemplo de proyectos (opcional).

## Scripts
| Comando | Qué hace |
|---|---|
| `npm run dev` | Modo desarrollo; se reinicia al guardar |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la versión compilada (producción) |
| `npm run typecheck` | Revisa tipos sin compilar |

## Estructura
```
src/
  config/        env (validado), db, cloudinary, mailer
  middlewares/   auth (JWT + roles), validate (Zod), error-handler
  modules/       una carpeta por recurso: auth, noticias, proyectos, voluntarios, contacto, uploads, stats
  utils/         tokens, errores, escape de HTML
  app.ts         arma Express (helmet, cors, rutas)
  index.ts       arranca el servidor
database/        schema.sql y seed
```

## Endpoints (`/api/v1`)
🔓 público · 👤 con sesión · 🛡️ admin/colaborador

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/health` | 🔓 | Estado de la API |
| POST | `/auth/register` | 🔓 | Registro (siempre como `customer`) |
| POST | `/auth/login` | 🔓 | Devuelve `{ user, token }` |
| POST | `/auth/google` | 🔓 | Recibe `{ idToken }` de Google y lo verifica |
| GET | `/auth/me` | 👤 | Usuario actual |
| POST | `/auth/send-verify-email` | 🔓 | Envía el enlace para activar la cuenta |
| POST | `/auth/verify-email` | 🔓 | Activa la cuenta con el token del correo |
| POST | `/auth/forgot-password` | 🔓 | Envía el enlace para cambiar la contraseña |
| POST | `/auth/validate-reset-token` | 🔓 | Valida el enlace |
| POST | `/auth/reset-password` | 🔓 | `{ token, newPassword }` |
| GET | `/noticias` · `/noticias/:id` | 🔓 | Listar / ver |
| POST · PUT · DELETE | `/noticias[/:id]` | 🛡️ | Crear / editar / borrar |
| GET | `/proyectos?anio=2025` · `/proyectos/:id` | 🔓 | Listar / ver |
| POST · PUT · DELETE | `/proyectos[/:id]` | 🛡️ | Crear / editar / borrar |
| POST | `/voluntarios` | 👤 | Solicitud de voluntariado |
| GET | `/voluntarios` | 🛡️ | Ver solicitudes |
| POST | `/contacto` | 🔓 | Formulario de contacto |
| POST | `/newsletter` | 🔓 | Suscripción |
| POST | `/uploads` | 🛡️ | Subir imagen o video a Cloudinary (form-data, campo `file`) |
| GET | `/stats` | 🛡️ | Totales para el panel |

Las rutas protegidas necesitan la cabecera `Authorization: Bearer <token>`.

## Seguridad incluida
- Contraseñas con bcrypt, JWT con "propósito" (un token de sesión no sirve para cambiar la contraseña, ni al revés)
- Validación de datos con Zod y mensajes en español
- Helmet, CORS con lista de dominios permitidos y límite de intentos en login y formularios
- Los formularios no pueden inyectar HTML en los correos

## Publicar (deploy)
Sirve cualquier servicio de Node: Render, Railway, Fly.io, Clever Cloud o un VPS.
Build: `npm install && npm run build` · Start: `npm start`.
Configura las variables de `.env.example` y agrega en `CORS_ORIGINS` los dominios reales del frontend y del admin.
