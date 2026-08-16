# ==============================================================================
# Dockerfile Multi-stage para ActuemosYaColombia (Next.js 14 + better-sqlite3)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Dependencias de Compilación (deps)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS deps
# Instalar utilidades del sistema necesarias para compilar better-sqlite3 (C++)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ------------------------------------------------------------------------------
# 2. Compilación / Construcción (builder)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Argumentos de construcción para Next.js (Variables públicas requeridas en build time)
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Asegurar que el directorio de assets estáticos públicos exista
RUN mkdir -p /app/public

RUN npm run build

# ------------------------------------------------------------------------------
# 3. Entorno de Ejecución Ligero (runner)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

# Instalar compatibilidad libc para better-sqlite3 y su-exec para gestión de permisos en volúmenes
RUN apk add --no-cache libc6-compat su-exec

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL=/data/database.sqlite

# Seguridad: Usuario de sistema sin privilegios de superusuario
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Directorio de persistencia SQLite para el volumen bind y directorio de trabajo
RUN mkdir -p /data /app && chown -R nextjs:nodejs /data /app

# Copiar artefactos optimizados de Next.js Standalone
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar scripts de migración, seed y entrypoint
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/src/db/migrations ./src/db/migrations
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
