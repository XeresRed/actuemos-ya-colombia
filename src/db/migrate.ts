import fs from 'fs';
import path from 'path';
import { getDb } from './client';

export function runMigrations() {
  console.log('🚀 Iniciando ejecución de migraciones SQLite...');
  const db = getDb();
  const migrationsDir = path.join(process.cwd(), 'src', 'db', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Directorio de migraciones no encontrado: ${migrationsDir}`);
    return;
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    console.log(`📄 Aplicando migración: ${file}`);
    const sql = fs.readFileSync(filePath, 'utf-8');
    db.exec(sql);
  }

  console.log('✅ Migraciones ejecutadas con éxito.');
}

if (require.main === module || process.argv[1]?.includes('migrate')) {
  runMigrations();
}
