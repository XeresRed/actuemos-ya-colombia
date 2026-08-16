import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import { getDb } from '../client';
import type { 
  Iniciativa, 
  CreateIniciativaDTO, 
  UpdateIniciativaDTO, 
  IniciativaFilter, 
  IniciativaEstado 
} from '../../core/domain/iniciativa';
import { NotFoundError } from '../../core/errors';

interface IniciativaRow {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  url_oficial: string;
  contacto: string | null;
  cobertura_geografica: string | null;
  estado_operacion: IniciativaEstado;
  creado_en: string;
}

function mapRowToIniciativa(row: IniciativaRow): Iniciativa {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    categoria: row.categoria,
    urlOficial: row.url_oficial,
    contacto: row.contacto,
    coberturaGeografica: row.cobertura_geografica,
    estadoOperacion: row.estado_operacion,
    creadoEn: row.creado_en,
  };
}

export const IniciativaRepository = {
  findById(id: string, db: Database.Database = getDb()): Iniciativa | null {
    const stmt = db.prepare('SELECT * FROM iniciativas_activas WHERE id = ?');
    const row = stmt.get(id) as IniciativaRow | undefined;
    return row ? mapRowToIniciativa(row) : null;
  },

  findMany(filters: IniciativaFilter = {}, db: Database.Database = getDb()): { iniciativas: Iniciativa[]; total: number } {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.categoria) {
      if (filters.categoria === 'ong') {
        conditions.push("categoria = 'ong'");
      } else if (filters.categoria === 'colectivo') {
        conditions.push("(categoria = 'colectivo' OR categoria = 'campaña')");
      } else {
        conditions.push('categoria = ?');
        params.push(filters.categoria);
      }
    }

    if (filters.estadoOperacion) {
      conditions.push('estado_operacion = ?');
      params.push(filters.estadoOperacion);
    }

    if (filters.coberturaGeografica) {
      conditions.push('cobertura_geografica LIKE ?');
      params.push(`%${filters.coberturaGeografica}%`);
    }

    if (filters.search) {
      conditions.push('(nombre LIKE ? OR descripcion LIKE ? OR categoria LIKE ? OR cobertura_geografica LIKE ?)');
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM iniciativas_activas ${whereClause}`);
    const countResult = countStmt.get(...params) as { count: number };
    const total = countResult.count;

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;
    const orderDir = filters.order === 'asc' ? 'ASC' : 'DESC';

    const queryStmt = db.prepare(`
      SELECT * FROM iniciativas_activas 
      ${whereClause} 
      ORDER BY creado_en ${orderDir}, rowid ${orderDir}
      LIMIT ? OFFSET ?
    `);

    const rows = queryStmt.all(...params, limit, offset) as IniciativaRow[];
    return {
      iniciativas: rows.map(mapRowToIniciativa),
      total,
    };
  },

  findOfficial(db: Database.Database = getDb()): Iniciativa[] {
    const stmt = db.prepare(`
      SELECT * FROM iniciativas_activas 
      WHERE categoria = 'organismo_oficial' AND estado_operacion = 'activa' 
      ORDER BY creado_en ASC
    `);
    const rows = stmt.all() as IniciativaRow[];
    return rows.map(mapRowToIniciativa);
  },

  create(dto: CreateIniciativaDTO, db: Database.Database = getDb()): Iniciativa {
    const id = dto.id || randomUUID();
    const estado: IniciativaEstado = dto.estadoOperacion || 'activa';

    const stmt = db.prepare(`
      INSERT INTO iniciativas_activas (
        id, nombre, descripcion, categoria, url_oficial, contacto, cobertura_geografica, estado_operacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      dto.nombre,
      dto.descripcion,
      dto.categoria,
      dto.urlOficial,
      dto.contacto ?? null,
      dto.coberturaGeografica ?? null,
      estado
    );

    const created = this.findById(id, db);
    if (!created) {
      throw new Error('Fallo al recuperar la iniciativa creada');
    }
    return created;
  },

  update(id: string, dto: UpdateIniciativaDTO, db: Database.Database = getDb()): Iniciativa {
    const existing = this.findById(id, db);
    if (!existing) {
      throw new NotFoundError(`Iniciativa con ID '${id}' no encontrada`);
    }

    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.nombre !== undefined) {
      fields.push('nombre = ?');
      params.push(dto.nombre);
    }
    if (dto.descripcion !== undefined) {
      fields.push('descripcion = ?');
      params.push(dto.descripcion);
    }
    if (dto.categoria !== undefined) {
      fields.push('categoria = ?');
      params.push(dto.categoria);
    }
    if (dto.urlOficial !== undefined) {
      fields.push('url_oficial = ?');
      params.push(dto.urlOficial);
    }
    if (dto.contacto !== undefined) {
      fields.push('contacto = ?');
      params.push(dto.contacto);
    }
    if (dto.coberturaGeografica !== undefined) {
      fields.push('cobertura_geografica = ?');
      params.push(dto.coberturaGeografica);
    }
    if (dto.estadoOperacion !== undefined) {
      fields.push('estado_operacion = ?');
      params.push(dto.estadoOperacion);
    }

    if (fields.length === 0) {
      return existing;
    }

    params.push(id);
    const stmt = db.prepare(`UPDATE iniciativas_activas SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return this.findById(id, db)!;
  },

  delete(id: string, db: Database.Database = getDb()): boolean {
    const stmt = db.prepare('DELETE FROM iniciativas_activas WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },
};
