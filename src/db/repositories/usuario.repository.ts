import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import { getDb } from '../client';
import type { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO, UsuarioRol } from '../../core/domain/usuario';
import { NotFoundError, ConflictError } from '../../core/errors';

interface UsuarioRow {
  id: string;
  email: string;
  nombre: string | null;
  rol: UsuarioRol;
  activo: number;
  creado_en: string;
}

function mapRowToUsuario(row: UsuarioRow): Usuario {
  return {
    id: row.id,
    email: row.email,
    nombre: row.nombre,
    rol: row.rol,
    activo: Boolean(row.activo),
    creadoEn: row.creado_en,
  };
}

export const UsuarioRepository = {
  findById(id: string, db: Database.Database = getDb()): Usuario | null {
    const stmt = db.prepare('SELECT * FROM usuarios WHERE id = ?');
    const row = stmt.get(id) as UsuarioRow | undefined;
    return row ? mapRowToUsuario(row) : null;
  },

  findByEmail(email: string, db: Database.Database = getDb()): Usuario | null {
    const stmt = db.prepare('SELECT * FROM usuarios WHERE LOWER(email) = LOWER(?)');
    const row = stmt.get(email.trim()) as UsuarioRow | undefined;
    return row ? mapRowToUsuario(row) : null;
  },

  findMany(activeOnly = false, db: Database.Database = getDb()): Usuario[] {
    const query = activeOnly 
      ? 'SELECT * FROM usuarios WHERE activo = 1 ORDER BY creado_en DESC'
      : 'SELECT * FROM usuarios ORDER BY creado_en DESC';
    const stmt = db.prepare(query);
    const rows = stmt.all() as UsuarioRow[];
    return rows.map(mapRowToUsuario);
  },

  create(dto: CreateUsuarioDTO, db: Database.Database = getDb()): Usuario {
    const existing = this.findByEmail(dto.email, db);
    if (existing) {
      throw new ConflictError(`El usuario con correo '${dto.email}' ya existe`);
    }

    const id = dto.id || randomUUID();
    const activo = dto.activo !== undefined ? (dto.activo ? 1 : 0) : 0;

    const stmt = db.prepare(`
      INSERT INTO usuarios (id, email, nombre, rol, activo)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, dto.email.trim().toLowerCase(), dto.nombre ?? null, dto.rol, activo);

    const created = this.findById(id, db);
    if (!created) {
      throw new Error('Fallo al recuperar el usuario creado');
    }
    return created;
  },

  update(id: string, dto: UpdateUsuarioDTO, db: Database.Database = getDb()): Usuario {
    const existing = this.findById(id, db);
    if (!existing) {
      throw new NotFoundError(`Usuario con ID '${id}' no encontrado`);
    }

    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.nombre !== undefined) {
      fields.push('nombre = ?');
      params.push(dto.nombre);
    }
    if (dto.rol !== undefined) {
      fields.push('rol = ?');
      params.push(dto.rol);
    }
    if (dto.activo !== undefined) {
      fields.push('activo = ?');
      params.push(dto.activo ? 1 : 0);
    }

    if (fields.length === 0) {
      return existing;
    }

    params.push(id);
    const stmt = db.prepare(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return this.findById(id, db)!;
  },

  delete(id: string, db: Database.Database = getDb()): boolean {
    const stmt = db.prepare('DELETE FROM usuarios WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },
};
