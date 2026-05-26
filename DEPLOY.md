# IntegraJobs — Guía de Despliegue (Arquitectura v3.0.0)

## Requisitos Previos

| Herramienta | Versión mínima | Uso |
|---|---|---|
| Node.js | 20 LTS | Backend y frontend en desarrollo |
| npm | 10+ | Gestión de dependencias |
| Docker | 24+ | Contenedor de producción |
| Docker Compose | v2 (plugin) | Orquestación de servicios |
| PostgreSQL | 16 (opcional) | Solo si se corre en host sin Docker |

---

## Entorno de Desarrollo (Local)

La arquitectura v3.0.0 separa el backend y el frontend en dos procesos
independientes. Ambos deben estar corriendo al mismo tiempo durante el
desarrollo.

### 1. Backend (Express 5 + Prisma)

```bash
# Desde la raíz del proyecto
cd backend
npm install
```

Copia el archivo de variables de entorno y edita los valores:

```bash
cp .env.example .env
```

Variables mínimas requeridas en `backend/.env`:

```
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/portal_db"
JWT_SECRET="cambia_esto_por_un_secreto_seguro"
PORT=3000
NODE_ENV=development
```

Sincroniza el esquema de Prisma con la base de datos:

```bash
npx prisma db push
```

Popula la base de datos con datos iniciales:

```bash
npx prisma db seed
```

Inicia el servidor de desarrollo (puerto **3000**):

```bash
npm run dev
```

### 2. Frontend (Vite + React)

En una terminal separada, desde la raíz del proyecto:

```bash
cd frontend-react
npm install
npm run dev
```

El servidor de Vite corre en el puerto **5173**. El archivo
`frontend-react/vite.config.js` ya incluye un proxy que redirige
automáticamente todas las peticiones `/api/*` al backend en `localhost:3000`,
por lo que no se requiere configuración adicional.

Accede a la aplicación en: `http://localhost:5173`

---

## Entorno de Producción (Docker)

En producción la aplicación se distribuye como un único contenedor gracias al
**build multi-etapa** definido en el `Dockerfile` de la raíz. El proceso
ocurre en dos fases automáticas:

1. **Etapa `frontend-builder`**: instala dependencias de Node y ejecuta
   `vite build`, generando los archivos estáticos optimizados.
2. **Etapa `runner`**: instala únicamente las dependencias de producción del
   backend, genera el cliente de Prisma y copia el `dist` de React al path
   que Express espera. El resultado es una imagen Alpine mínima que sirve
   tanto la API como el SPA desde el puerto 3000.

### Levantar todos los servicios

```bash
# Desde la raíz del proyecto
docker compose up -d --build
```

Esto construye la imagen, levanta el contenedor de PostgreSQL (`portal_db`) y
el de la API (`portal_api`). La aplicación completa queda disponible en:

`http://localhost:3000`

### Detener los servicios

```bash
docker compose down
```

Para eliminar también los volúmenes de datos:

```bash
docker compose down -v
```

---

## Gestión de Base de Datos

### Migraciones y esquema

Los comandos de Prisma se ejecutan desde la carpeta `backend/` apuntando a la
base de datos. En producción Docker, PostgreSQL está expuesto en el puerto
**5434** del host.

```bash
cd backend

# Aplicar migraciones pendientes (flujo de producción)
DATABASE_URL="postgresql://portal:portal_secret@localhost:5434/portal_db" \
  npx prisma migrate deploy

# Sincronizar esquema sin historial de migraciones (desarrollo)
DATABASE_URL="postgresql://portal:portal_secret@localhost:5434/portal_db" \
  npx prisma db push

# Poblar datos iniciales
DATABASE_URL="postgresql://portal:portal_secret@localhost:5434/portal_db" \
  npx prisma db seed
```

### Prisma Studio

Interfaz visual para explorar y editar datos directamente:

```bash
cd backend
DATABASE_URL="postgresql://portal:portal_secret@localhost:5434/portal_db" \
  npx prisma studio
```

Accesible en `http://localhost:5555` mientras el comando esté activo.

---

## Variables de Entorno en Producción

Las variables del servicio `api` se configuran en `docker-compose.yml`.
Para un despliegue real, reemplaza los valores por defecto antes de construir:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar tokens JWT — debe ser aleatorio y largo |
| `PORT` | Puerto interno del contenedor (por defecto `3000`) |
| `NODE_ENV` | Debe ser `production` en despliegues reales |
