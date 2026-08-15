#!/bin/sh
set -e

echo "🟢 [AYC Entrypoint] Iniciando contenedor ActuemosYaColombia..."

# Asegurar que el directorio de la base de datos exista
DB_DIR=$(dirname "${DATABASE_URL:-/data/database.sqlite}")
mkdir -p "$DB_DIR"

# Ejecutar migraciones automáticas de SQLite
if [ -f "scripts/migrate.js" ]; then
  echo "📦 [AYC Entrypoint] Verificando y aplicando migraciones de base de datos..."
  node scripts/migrate.js
else
  echo "⚠️ [AYC Entrypoint] No se encontró scripts/migrate.js, omitiendo migraciones automáticas."
fi

echo "🚀 [AYC Entrypoint] Iniciando servidor Next.js..."
exec "$@"
