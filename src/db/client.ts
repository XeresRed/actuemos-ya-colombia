import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'database.sqlite');
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
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
