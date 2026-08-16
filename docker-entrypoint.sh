#!/bin/sh
set -e

echo "🟢 [AYC Entrypoint] Iniciando contenedor ActuemosYaColombia..."

# Asegurar que DATABASE_URL use la ruta absoluta del volumen montado (/data) en Docker
if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "./data/database.sqlite" ] || [ "$DATABASE_URL" = "data/database.sqlite" ]; then
  export DATABASE_URL="/data/database.sqlite"
fi

DB_DIR=$(dirname "$DATABASE_URL")

# Asegurar que el directorio de la base de datos exista
if [ ! -d "$DB_DIR" ]; then
  mkdir -p "$DB_DIR" 2>/dev/null || true
fi

# 1. Ejecutar migraciones automáticas de SQLite
if [ -f "scripts/migrate.js" ]; then
  echo "📦 [AYC Entrypoint] Verificando y aplicando migraciones de base de datos..."
  node scripts/migrate.js
else
  echo "⚠️ [AYC Entrypoint] No se encontró scripts/migrate.js, omitiendo migraciones automáticas."
fi

# 2. Ejecutar sembrado de datos iniciales si AUTO_SEED está activo
if [ "${AUTO_SEED}" = "true" ] || [ "${AUTO_SEED}" = "1" ]; then
  if [ -f "scripts/seed.js" ]; then
    echo "🌱 [AYC Entrypoint] AUTO_SEED detectado: Aplicando datos iniciales y canales oficiales..."
    node scripts/seed.js
  fi
fi

echo "🚀 [AYC Entrypoint] Iniciando servidor Next.js..."
exec "$@"
