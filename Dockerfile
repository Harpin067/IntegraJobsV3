# ─────────────────────────────────────────────
# Etapa 1: compilación del frontend con Vite
# ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend-react

COPY frontend-react/package*.json ./
RUN npm ci

COPY frontend-react/ ./
RUN npm run build


# ─────────────────────────────────────────────
# Etapa 2: runtime de producción
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app/backend

# Dependencias del backend (solo producción)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Código fuente y esquema de Prisma
COPY backend/src ./src
COPY backend/prisma ./prisma

# Genera el cliente de Prisma para el entorno Alpine
RUN npx prisma generate

# Copia el dist de React al path que app.js espera:
# path.resolve('/app/backend/src', '../../frontend-react/dist')
# → /app/frontend-react/dist
COPY --from=frontend-builder /build/frontend-react/dist /app/frontend-react/dist

EXPOSE 3000

CMD ["node", "src/server.js"]
