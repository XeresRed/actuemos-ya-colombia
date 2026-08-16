import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import { getDb } from '../client';
import type {
  SolicitudAsistenciaLegal,
  CreateSolicitudLegalDTO,
  UpdateSolicitudLegalDTO,
  SolicitudLegalFilter,
  SolicitudLegalEstado,
} from '../../core/domain/solicitud-legal';
import { NotFoundError } from '../../core/errors';

interface SolicitudLegalRow {
  id: string;
  nombre_ciudadano: string;
  tipo_documento: string;
  cedula_ciudadano: string;
  email_contacto: string;
  telefono_contacto: string;
  departamento: string;
  municipio: string;
  direccion_fisica: string | null;
  asunto: string;
  hechos: string;
  peticiones: string;
  anexos: string | null;
  estado: SolicitudLegalEstado;
  abogado_asignado: string | null;
  notas_seguimiento: string | null;
  creado_en: string;
  actualizado_en: string;
}

function mapRowToSolicitud(row: SolicitudLegalRow): SolicitudAsistenciaLegal {
  return {
    id: row.id,
    nombreCiudadano: row.nombre_ciudadano,
    tipoDocumento: row.tipo_documento || 'CC',
    cedulaCiudadano: row.cedula_ciudadano,
    emailContacto: row.email_contacto,
    telefonoContacto: row.telefono_contacto,
    departamento: row.departamento,
    municipio: row.municipio,
    direccionFisica: row.direccion_fisica,
    asunto: row.asunto,
    hechos: row.hechos,
    peticiones: row.peticiones,
    anexos: row.anexos,
    estado: row.estado,
    abogadoAsignado: row.abogado_asignado,
    notasSeguimiento: row.notas_seguimiento,
    creadoEn: row.creado_en,
    actualizadoEn: row.actualizado_en,
  };
}

export const SolicitudLegalRepository = {
  findById(id: string, db: Database.Database = getDb()): SolicitudAsistenciaLegal | null {
    const stmt = db.prepare('SELECT * FROM solicitudes_asistencia_legal WHERE id = ?');
    const row = stmt.get(id) as SolicitudLegalRow | undefined;
    return row ? mapRowToSolicitud(row) : null;
  },

  findMany(
    filters: SolicitudLegalFilter = {},
    db: Database.Database = getDb()
  ): { solicitudes: SolicitudAsistenciaLegal[]; total: number } {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.estado) {
      if (Array.isArray(filters.estado)) {
        const placeholders = filters.estado.map(() => '?').join(',');
        conditions.push(`estado IN (${placeholders})`);
        params.push(...filters.estado);
      } else {
        conditions.push('estado = ?');
        params.push(filters.estado);
      }
    }

    if (filters.departamento) {
      conditions.push('departamento = ?');
      params.push(filters.departamento);
    }

    if (filters.municipio) {
      conditions.push('municipio = ?');
      params.push(filters.municipio);
    }

    if (filters.search) {
      conditions.push(
        '(nombre_ciudadano LIKE ? OR cedula_ciudadano LIKE ? OR asunto LIKE ? OR hechos LIKE ? OR email_contacto LIKE ?)'
      );
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM solicitudes_asistencia_legal ${whereClause}`);
    const countResult = countStmt.get(...params) as { count: number };
    const total = countResult.count;

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;
    const orderDir = filters.order === 'asc' ? 'ASC' : 'DESC';

    const queryStmt = db.prepare(`
      SELECT * FROM solicitudes_asistencia_legal
      ${whereClause}
      ORDER BY creado_en ${orderDir}, rowid ${orderDir}
      LIMIT ? OFFSET ?
    `);

    const rows = queryStmt.all(...params, limit, offset) as SolicitudLegalRow[];
    return {
      solicitudes: rows.map(mapRowToSolicitud),
      total,
    };
  },

  create(dto: CreateSolicitudLegalDTO, db: Database.Database = getDb()): SolicitudAsistenciaLegal {
    const id = dto.id || randomUUID();
    const tipoDocumento = dto.tipoDocumento || 'CC';
    const estado: SolicitudLegalEstado = dto.estado || 'pendiente';

    const stmt = db.prepare(`
      INSERT INTO solicitudes_asistencia_legal (
        id, nombre_ciudadano, tipo_documento, cedula_ciudadano, email_contacto, telefono_contacto,
        departamento, municipio, direccion_fisica, asunto, hechos, peticiones, anexos,
        estado, abogado_asignado, notas_seguimiento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      dto.nombreCiudadano,
      tipoDocumento,
      dto.cedulaCiudadano,
      dto.emailContacto,
      dto.telefonoContacto,
      dto.departamento,
      dto.municipio,
      dto.direccionFisica ?? null,
      dto.asunto,
      dto.hechos,
      dto.peticiones,
      dto.anexos ?? null,
      estado,
      dto.abogadoAsignado ?? null,
      dto.notasSeguimiento ?? null
    );

    const created = this.findById(id, db);
    if (!created) {
      throw new Error('Fallo al recuperar la solicitud legal recién creada');
    }
    return created;
  },

  update(id: string, dto: UpdateSolicitudLegalDTO, db: Database.Database = getDb()): SolicitudAsistenciaLegal {
    const existing = this.findById(id, db);
    if (!existing) {
      throw new NotFoundError(`Solicitud legal con ID '${id}' no encontrada`);
    }

    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.estado !== undefined) {
      fields.push('estado = ?');
      params.push(dto.estado);
    }
    if (dto.abogadoAsignado !== undefined) {
      fields.push('abogado_asignado = ?');
      params.push(dto.abogadoAsignado);
    }
    if (dto.notasSeguimiento !== undefined) {
      fields.push('notas_seguimiento = ?');
      params.push(dto.notasSeguimiento);
    }

    if (fields.length === 0) {
      return existing;
    }

    fields.push('actualizado_en = CURRENT_TIMESTAMP');
    params.push(id);

    const stmt = db.prepare(`UPDATE solicitudes_asistencia_legal SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return this.findById(id, db)!;
  },

  delete(id: string, db: Database.Database = getDb()): boolean {
    const stmt = db.prepare('DELETE FROM solicitudes_asistencia_legal WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  countByEstado(db: Database.Database = getDb()): Record<SolicitudLegalEstado, number> {
    const stmt = db.prepare('SELECT estado, COUNT(*) as count FROM solicitudes_asistencia_legal GROUP BY estado');
    const rows = stmt.all() as { estado: SolicitudLegalEstado; count: number }[];

    const counts: Record<SolicitudLegalEstado, number> = {
      pendiente: 0,
      en_contacto: 0,
      atendida: 0,
      cerrada: 0,
    };

    for (const row of rows) {
      if (counts[row.estado] !== undefined) {
        counts[row.estado] = row.count;
      }
    }

    return counts;
  },
};
