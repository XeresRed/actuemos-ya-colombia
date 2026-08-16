const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

function runMigrations() {
  console.log('🚀 [DB Migration] Iniciando ejecución de migraciones SQLite...');
  const rawPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'database.sqlite');
  const dbPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch {
      // Ignorar si ya existe o es gestionado por volumen Docker
    }
  }

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('busy_timeout = 5000');

  // 1. Crear tabla de control de versiones de migraciones si no existe
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ubicar directorio de migraciones
  let migrationsDir = path.join(process.cwd(), 'src', 'db', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    migrationsDir = path.join(process.cwd(), 'migrations');
  }

  if (!fs.existsSync(migrationsDir)) {
    console.warn(`⚠️ [DB Migration] Directorio de migraciones no encontrado en: ${migrationsDir}`);
    db.close();
    return;
  }

  // 2. Obtener lista de migraciones ya aplicadas
  const executedRows = db.prepare('SELECT name FROM _migrations').all();
  const executedNames = new Set(executedRows.map((row) => row.name));

  // 3. Filtrar archivos pendientes ordenados alfabéticamente
  const allFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  const pendingFiles = allFiles.filter((f) => !executedNames.has(f));

  if (pendingFiles.length === 0) {
    console.log(`✨ [DB Migration] Base de datos al día. No hay migraciones pendientes (${executedNames.size} ya aplicadas).`);
    db.close();
    return;
  }

  console.log(`📦 [DB Migration] ${pendingFiles.length} migración(es) pendiente(s) por aplicar.`);

  // 4. Aplicar cada migración pendiente dentro de una transacción segura
  const executeMigration = db.transaction((fileName, sqlContent) => {
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
      db.close();
      throw error;
    }
  }

  console.log('🎉 [DB Migration] Todas las migraciones pendientes fueron aplicadas con éxito.');
  db.close();
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
