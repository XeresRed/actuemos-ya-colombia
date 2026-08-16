import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

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

  dbInstance = new Database(dbPath);

  // Configuraciones PRAGMA de alto rendimiento y concurrencia WAL
  dbInstance.pragma('foreign_keys = ON');
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('synchronous = NORMAL');
  dbInstance.pragma('busy_timeout = 5000');
  dbInstance.pragma('temp_store = MEMORY');

  return dbInstance;
}

export default getDb;
