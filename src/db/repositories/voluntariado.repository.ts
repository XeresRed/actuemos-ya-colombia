import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import { getDb } from '../client';
import type { 
  Voluntariado, 
  CreateVoluntariadoDTO, 
  UpdateVoluntariadoDTO, 
  VoluntariadoFilter, 
  TipoVoluntariado, 
  EstadoVoluntariado 
} from '../../core/domain/voluntariado';
import { NotFoundError } from '../../core/errors';

interface VoluntariadoRow {
  id: string;
  tipo: TipoVoluntariado;
  area_profesional: string;
  titulo_necesidad: string;
  descripcion: string;
  nombre_contacto: string;
  organizacion: string | null;
  email_contacto: string;
  telefono_contacto: string | null;
  ubicacion: string | null;
  estado: EstadoVoluntariado;
  creado_en: string;
}

function mapRowToVoluntariado(row: VoluntariadoRow): Voluntariado {
  return {
    id: row.id,
    tipo: row.tipo,
    areaProfesional: row.area_profesional,
    tituloNecesidad: row.titulo_necesidad,
    descripcion: row.descripcion,
    nombreContacto: row.nombre_contacto,
    organizacion: row.organizacion || null,
    emailContacto: row.email_contacto,
    telefonoContacto: row.telefono_contacto,
    ubicacion: row.ubicacion,
    estado: row.estado,
    creadoEn: row.creado_en,
  };
}

export const VoluntariadoRepository = {
  findById(id: string, db: Database.Database = getDb()): Voluntariado | null {
    const stmt = db.prepare('SELECT * FROM voluntariado_profesional WHERE id = ?');
    const row = stmt.get(id) as VoluntariadoRow | undefined;
    return row ? mapRowToVoluntariado(row) : null;
  },

  findMany(filters: VoluntariadoFilter = {}, db: Database.Database = getDb()): { voluntariados: Voluntariado[]; total: number } {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.tipo) {
      conditions.push('tipo = ?');
      params.push(filters.tipo);
    }

    if (filters.areaProfesional) {
      conditions.push('area_profesional = ?');
      params.push(filters.areaProfesional);
    }

    if (filters.estado) {
      conditions.push('estado = ?');
      params.push(filters.estado);
    }

    if (filters.ubicacion) {
      conditions.push('ubicacion LIKE ?');
      params.push(`%${filters.ubicacion}%`);
    }

    if (filters.search) {
      conditions.push('(titulo_necesidad LIKE ? OR descripcion LIKE ? OR area_profesional LIKE ? OR ubicacion LIKE ? OR nombre_contacto LIKE ? OR organizacion LIKE ?)');
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM voluntariado_profesional ${whereClause}`);
    const countResult = countStmt.get(...params) as { count: number };
    const total = countResult.count;

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;
    const orderDir = filters.order === 'asc' ? 'ASC' : 'DESC';

    const queryStmt = db.prepare(`
      SELECT * FROM voluntariado_profesional 
      ${whereClause} 
      ORDER BY creado_en ${orderDir}, rowid ${orderDir}
      LIMIT ? OFFSET ?
    `);

    const rows = queryStmt.all(...params, limit, offset) as VoluntariadoRow[];
    return {
      voluntariados: rows.map(mapRowToVoluntariado),
      total,
    };
  },

  create(dto: CreateVoluntariadoDTO, db: Database.Database = getDb()): Voluntariado {
    const id = dto.id || randomUUID();
    const estado: EstadoVoluntariado = dto.estado || 'pendiente';

    const stmt = db.prepare(`
      INSERT INTO voluntariado_profesional (
        id, tipo, area_profesional, titulo_necesidad, descripcion,
        nombre_contacto, organizacion, email_contacto, telefono_contacto, ubicacion, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      dto.tipo,
      dto.areaProfesional,
      dto.tituloNecesidad,
      dto.descripcion,
      dto.nombreContacto,
      dto.organizacion ?? null,
      dto.emailContacto.trim().toLowerCase(),
      dto.telefonoContacto ?? null,
      dto.ubicacion ?? null,
      estado
    );

    const created = this.findById(id, db);
    if (!created) {
      throw new Error('Fallo al recuperar el voluntariado creado');
    }
    return created;
  },

  update(id: string, dto: UpdateVoluntariadoDTO, db: Database.Database = getDb()): Voluntariado {
    const existing = this.findById(id, db);
    if (!existing) {
      throw new NotFoundError(`Registro de voluntariado con ID '${id}' no encontrado`);
    }

    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.areaProfesional !== undefined) {
      fields.push('area_profesional = ?');
      params.push(dto.areaProfesional);
    }
    if (dto.tituloNecesidad !== undefined) {
      fields.push('titulo_necesidad = ?');
      params.push(dto.tituloNecesidad);
    }
    if (dto.descripcion !== undefined) {
      fields.push('descripcion = ?');
      params.push(dto.descripcion);
    }
    if (dto.nombreContacto !== undefined) {
      fields.push('nombre_contacto = ?');
      params.push(dto.nombreContacto);
    }
    if (dto.organizacion !== undefined) {
      fields.push('organizacion = ?');
      params.push(dto.organizacion);
    }
    if (dto.emailContacto !== undefined) {
      fields.push('email_contacto = ?');
      params.push(dto.emailContacto.trim().toLowerCase());
    }
    if (dto.telefonoContacto !== undefined) {
      fields.push('telefono_contacto = ?');
      params.push(dto.telefonoContacto);
    }
    if (dto.ubicacion !== undefined) {
      fields.push('ubicacion = ?');
      params.push(dto.ubicacion);
    }
    if (dto.estado !== undefined) {
      fields.push('estado = ?');
      params.push(dto.estado);
    }

    if (fields.length === 0) {
      return existing;
    }

    params.push(id);
    const stmt = db.prepare(`UPDATE voluntariado_profesional SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return this.findById(id, db)!;
  },

  updateStatus(id: string, estado: EstadoVoluntariado, db: Database.Database = getDb()): Voluntariado {
    return this.update(id, { estado }, db);
  },

  delete(id: string, db: Database.Database = getDb()): boolean {
    const stmt = db.prepare('DELETE FROM voluntariado_profesional WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },
};
