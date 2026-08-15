import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import { getDb } from '../client';
import type { 
  ReporteBusqueda, 
  CreateReporteDTO, 
  UpdateReporteDTO, 
  BusquedaFilter, 
  TipoReporte, 
  EstadoBusqueda 
} from '../../core/domain/busqueda';
import { NotFoundError } from '../../core/errors';

interface ReporteBusquedaRow {
  id: string;
  tipo: TipoReporte;
  nombre: string | null;
  especie: string | null;
  descripcion_rasgos: string;
  ubicacion: string;
  foto_url: string | null;
  estado: EstadoBusqueda;
  contacto_emergencia: string;
  verificado_por_supervisor: number;
  creado_en: string;
}

function mapRowToReporte(row: ReporteBusquedaRow): ReporteBusqueda {
  return {
    id: row.id,
    tipo: row.tipo,
    nombre: row.nombre,
    especie: row.especie,
    descripcionRasgos: row.descripcion_rasgos,
    ubicacion: row.ubicacion,
    fotoUrl: row.foto_url,
    estado: row.estado,
    contactoEmergencia: row.contacto_emergencia,
    verificadoPorSupervisor: Boolean(row.verificado_por_supervisor),
    creadoEn: row.creado_en,
  };
}

export const BusquedaRepository = {
  findById(id: string, db: Database.Database = getDb()): ReporteBusqueda | null {
    const stmt = db.prepare('SELECT * FROM reportes_busqueda WHERE id = ?');
    const row = stmt.get(id) as ReporteBusquedaRow | undefined;
    return row ? mapRowToReporte(row) : null;
  },

  findMany(filters: BusquedaFilter = {}, db: Database.Database = getDb()): { reportes: ReporteBusqueda[]; total: number } {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.tipo) {
      conditions.push('tipo = ?');
      params.push(filters.tipo);
    }

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

    if (filters.ubicacion) {
      conditions.push('ubicacion LIKE ?');
      params.push(`%${filters.ubicacion}%`);
    }

    if (filters.search) {
      conditions.push('(nombre LIKE ? OR descripcion_rasgos LIKE ? OR especie LIKE ? OR ubicacion LIKE ?)');
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM reportes_busqueda ${whereClause}`);
    const countResult = countStmt.get(...params) as { count: number };
    const total = countResult.count;

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const queryStmt = db.prepare(`
      SELECT * FROM reportes_busqueda 
      ${whereClause} 
      ORDER BY creado_en DESC 
      LIMIT ? OFFSET ?
    `);

    const rows = queryStmt.all(...params, limit, offset) as ReporteBusquedaRow[];
    return {
      reportes: rows.map(mapRowToReporte),
      total,
    };
  },

  create(dto: CreateReporteDTO, db: Database.Database = getDb()): ReporteBusqueda {
    const id = dto.id || randomUUID();
    const estado: EstadoBusqueda = dto.estado || 'buscado';
    const verificado = dto.verificadoPorSupervisor ? 1 : 0;

    const stmt = db.prepare(`
      INSERT INTO reportes_busqueda (
        id, tipo, nombre, especie, descripcion_rasgos, ubicacion, foto_url, estado, contacto_emergencia, verificado_por_supervisor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      dto.tipo,
      dto.nombre ?? null,
      dto.especie ?? null,
      dto.descripcionRasgos,
      dto.ubicacion,
      dto.fotoUrl ?? null,
      estado,
      dto.contactoEmergencia,
      verificado
    );

    const created = this.findById(id, db);
    if (!created) {
      throw new Error('Fallo al recuperar el reporte de búsqueda creado');
    }
    return created;
  },

  update(id: string, dto: UpdateReporteDTO, db: Database.Database = getDb()): ReporteBusqueda {
    const existing = this.findById(id, db);
    if (!existing) {
      throw new NotFoundError(`Reporte de búsqueda con ID '${id}' no encontrado`);
    }

    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.nombre !== undefined) {
      fields.push('nombre = ?');
      params.push(dto.nombre);
    }
    if (dto.especie !== undefined) {
      fields.push('especie = ?');
      params.push(dto.especie);
    }
    if (dto.descripcionRasgos !== undefined) {
      fields.push('descripcion_rasgos = ?');
      params.push(dto.descripcionRasgos);
    }
    if (dto.ubicacion !== undefined) {
      fields.push('ubicacion = ?');
      params.push(dto.ubicacion);
    }
    if (dto.fotoUrl !== undefined) {
      fields.push('foto_url = ?');
      params.push(dto.fotoUrl);
    }
    if (dto.estado !== undefined) {
      fields.push('estado = ?');
      params.push(dto.estado);
    }
    if (dto.contactoEmergencia !== undefined) {
      fields.push('contacto_emergencia = ?');
      params.push(dto.contactoEmergencia);
    }
    if (dto.verificadoPorSupervisor !== undefined) {
      fields.push('verificado_por_supervisor = ?');
      params.push(dto.verificadoPorSupervisor ? 1 : 0);
    }

    if (fields.length === 0) {
      return existing;
    }

    params.push(id);
    const stmt = db.prepare(`UPDATE reportes_busqueda SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return this.findById(id, db)!;
  },

  updateStatus(id: string, estado: EstadoBusqueda, db: Database.Database = getDb()): ReporteBusqueda {
    return this.update(id, { estado }, db);
  },

  delete(id: string, db: Database.Database = getDb()): boolean {
    const stmt = db.prepare('DELETE FROM reportes_busqueda WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },
};
