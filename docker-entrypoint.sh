#!/bin/sh
set -e

echo "🟢 [AYC Entrypoint] Iniciando contenedor ActuemosYaColombia..."

# Asegurar que DATABASE_URL use la ruta absoluta del volumen montado (/data) en Docker
if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "./data/database.sqlite" ] || [ "$DATABASE_URL" = "data/database.sqlite" ]; then
  export DATABASE_URL="/data/database.sqlite"
fi

DB_DIR=$(dirname "$DATABASE_URL")

# 1. Asegurar existencia y permisos del directorio de persistencia (volumen montado)
mkdir -p "$DB_DIR"
chown -R nextjs:nodejs "$DB_DIR" /app 2>/dev/null || true
chmod 775 "$DB_DIR" 2>/dev/null || true

# 2. Ejecutar migraciones automáticas de SQLite como usuario nextjs
if [ -f "scripts/migrate.js" ]; then
  echo "📦 [AYC Entrypoint] Verificando y aplicando migraciones de base de datos..."
  if command -v su-exec >/dev/null 2>&1; then
    su-exec nextjs node scripts/migrate.js
  else
    node scripts/migrate.js
  fi
else
  echo "⚠️ [AYC Entrypoint] No se encontró scripts/migrate.js, omitiendo migraciones automáticas."
fi

# 3. Ejecutar sembrado de datos iniciales si AUTO_SEED está activo como usuario nextjs
if [ "${AUTO_SEED}" = "true" ] || [ "${AUTO_SEED}" = "1" ]; then
  if [ -f "scripts/seed.js" ]; then
    echo "🌱 [AYC Entrypoint] AUTO_SEED detectado: Aplicando datos iniciales y canales oficiales..."
    if command -v su-exec >/dev/null 2>&1; then
      su-exec nextjs node scripts/seed.js
    else
      node scripts/seed.js
    fi
  fi
fi

echo "🚀 [AYC Entrypoint] Iniciando servidor Next.js como usuario nextjs..."
if command -v su-exec >/dev/null 2>&1; then
  exec su-exec nextjs "$@"
else
  exec "$@"
fi
