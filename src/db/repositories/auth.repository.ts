import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import { getDb } from '../client';
import type { AuthToken, CreateAuthTokenDTO, AuthTokenType } from '../../core/domain/auth';

interface AuthTokenRow {
  id: string;
  email: string;
  codigo_hash: string;
  tipo: AuthTokenType;
  referencia_id: string | null;
  expira_en: string;
  usado: number;
  creado_en: string;
}

function mapRowToAuthToken(row: AuthTokenRow): AuthToken {
  return {
    id: row.id,
    email: row.email,
    codigoHash: row.codigo_hash,
    tipo: row.tipo,
    referenciaId: row.referencia_id,
    expiraEn: row.expira_en,
    usado: Boolean(row.usado),
    creadoEn: row.creado_en,
  };
}

export const AuthRepository = {
  createToken(dto: CreateAuthTokenDTO, db: Database.Database = getDb()): AuthToken {
    const id = dto.id || randomUUID();
    const usado = dto.usado !== undefined ? (dto.usado ? 1 : 0) : 0;

    const stmt = db.prepare(`
      INSERT INTO auth_tokens (id, email, codigo_hash, tipo, referencia_id, expira_en, usado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      dto.email.trim().toLowerCase(),
      dto.codigoHash,
      dto.tipo,
      dto.referenciaId ?? null,
      dto.expiraEn,
      usado
    );

    const stmtGet = db.prepare('SELECT * FROM auth_tokens WHERE id = ?');
    const row = stmtGet.get(id) as AuthTokenRow;
    return mapRowToAuthToken(row);
  },

  findValidToken(
    email: string, 
    codigoHash: string, 
    tipo: AuthTokenType, 
    db: Database.Database = getDb()
  ): AuthToken | null {
    const stmt = db.prepare(`
      SELECT * FROM auth_tokens 
      WHERE LOWER(email) = LOWER(?) 
        AND codigo_hash = ? 
        AND tipo = ? 
        AND usado = 0 
        AND expira_en > CURRENT_TIMESTAMP
      ORDER BY creado_en DESC 
      LIMIT 1
    `);

    const row = stmt.get(email.trim(), codigoHash, tipo) as AuthTokenRow | undefined;
    return row ? mapRowToAuthToken(row) : null;
  },

  findById(id: string, db: Database.Database = getDb()): AuthToken | null {
    const stmt = db.prepare('SELECT * FROM auth_tokens WHERE id = ?');
    const row = stmt.get(id) as AuthTokenRow | undefined;
    return row ? mapRowToAuthToken(row) : null;
  },

  markTokenAsUsed(id: string, db: Database.Database = getDb()): boolean {
    const stmt = db.prepare('UPDATE auth_tokens SET usado = 1 WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  invalidatePreviousTokens(email: string, tipo: AuthTokenType, db: Database.Database = getDb()): number {
    const stmt = db.prepare(`
      UPDATE auth_tokens 
      SET usado = 1 
      WHERE LOWER(email) = LOWER(?) AND tipo = ? AND usado = 0
    `);
    const result = stmt.run(email.trim(), tipo);
    return result.changes;
  },

  deleteExpiredTokens(db: Database.Database = getDb()): number {
    const stmt = db.prepare('DELETE FROM auth_tokens WHERE expira_en <= CURRENT_TIMESTAMP OR usado = 1');
    const result = stmt.run();
    return result.changes;
  },
};
