import fs from 'fs';
import path from 'path';
import { getDb } from './client';

export function runMigrations() {
  console.log('🚀 [DB Migration] Iniciando ejecución de migraciones SQLite...');
  const db = getDb();

  // 1. Crear tabla de control de versiones de migraciones si no existe
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrationsDir = path.join(process.cwd(), 'src', 'db', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ [DB Migration] Directorio de migraciones no encontrado: ${migrationsDir}`);
    return;
  }

  // 2. Obtener lista de migraciones ya aplicadas
  const executedRows = db.prepare('SELECT name FROM _migrations').all() as { name: string }[];
  const executedNames = new Set(executedRows.map(row => row.name));

  // 3. Filtrar archivos pendientes ordenados alfabéticamente
  const allFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  const pendingFiles = allFiles.filter(f => !executedNames.has(f));

  if (pendingFiles.length === 0) {
    console.log(`✨ [DB Migration] Base de datos al día. No hay migraciones pendientes (${executedNames.size} ya aplicadas).`);
    return;
  }

  console.log(`📦 [DB Migration] ${pendingFiles.length} migración(es) pendiente(s) por aplicar.`);

  // 4. Aplicar cada migración pendiente dentro de una transacción segura
  const executeMigration = db.transaction((fileName: string, sqlContent: string) => {
    db.exec(sqlContent);
    db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(fileName);
  });

  for (const file of pendingFiles) {
    const filePath = path.join(migrationsDir, file);
    console.log(`📄 [DB Migration] Aplicando migración incremental: ${file}`);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      executeMigration(file, sql);
      console.log(`✅ [DB Migration] Migración ${file} completada y registrada exitosamente.`);
    } catch (error) {
      console.error(`❌ [DB Migration] Error crítico ejecutando migración ${file}:`, error);
      throw error;
    }
  }

  console.log('🎉 [DB Migration] Todas las migraciones pendientes fueron aplicadas con éxito.');
}

if (require.main === module || process.argv[1]?.includes('migrate')) {
  runMigrations();
}
