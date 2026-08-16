import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import { getDb } from '../client';
import type { Idea, CreateIdeaDTO, UpdateIdeaDTO, IdeaFilter, IdeaEstado, AlcanceTipo } from '../../core/domain/idea';
import { NotFoundError } from '../../core/errors';

interface IdeaRow {
  id: string;
  titulo: string;
  descripcion_markdown: string;
  categoria: string;
  alcance_tipo: AlcanceTipo;
  alcance_detalle: string | null;
  estado: IdeaEstado;
  iniciativa_existente_url: string | null;
  es_anonimo: number;
  email_creador: string | null;
  verificado: number;
  creado_en: string;
  actualizado_en: string;
}

function mapRowToIdea(row: IdeaRow): Idea {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcionMarkdown: row.descripcion_markdown,
    categoria: row.categoria,
    alcanceTipo: row.alcance_tipo,
    alcanceDetalle: row.alcance_detalle,
    estado: row.estado,
    iniciativaExistenteUrl: row.iniciativa_existente_url,
    esAnonimo: Boolean(row.es_anonimo),
    emailCreador: row.email_creador,
    verificado: Boolean(row.verificado),
    creadoEn: row.creado_en,
    actualizadoEn: row.actualizado_en,
  };
}

export const IdeaRepository = {
  findById(id: string, db: Database.Database = getDb()): Idea | null {
    const stmt = db.prepare('SELECT * FROM ideas WHERE id = ?');
    const row = stmt.get(id) as IdeaRow | undefined;
    return row ? mapRowToIdea(row) : null;
  },

  findMany(filters: IdeaFilter = {}, db: Database.Database = getDb()): { ideas: Idea[]; total: number } {
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

    if (filters.categoria) {
      conditions.push('categoria = ?');
      params.push(filters.categoria);
    }

    if (filters.alcanceTipo) {
      conditions.push('alcance_tipo = ?');
      params.push(filters.alcanceTipo);
    }

    if (filters.search) {
      conditions.push('(titulo LIKE ? OR descripcion_markdown LIKE ? OR alcance_detalle LIKE ?)');
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM ideas ${whereClause}`);
    const countResult = countStmt.get(...params) as { count: number };
    const total = countResult.count;

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;
    const orderDir = filters.order === 'asc' ? 'ASC' : 'DESC';

    const queryStmt = db.prepare(`
      SELECT * FROM ideas 
      ${whereClause} 
      ORDER BY creado_en ${orderDir}, rowid ${orderDir}
      LIMIT ? OFFSET ?
    `);

    const rows = queryStmt.all(...params, limit, offset) as IdeaRow[];
    return {
      ideas: rows.map(mapRowToIdea),
      total,
    };
  },

  create(dto: CreateIdeaDTO, db: Database.Database = getDb()): Idea {
    const id = dto.id || randomUUID();
    const esAnonimo = dto.esAnonimo ?? (dto.emailCreador ? false : true);
    const verificado = dto.verificado ?? false;
    const estado: IdeaEstado = dto.estado || (esAnonimo ? 'borrador' : 'borrador');
    const alcanceTipo: AlcanceTipo = dto.alcanceTipo || 'general';

    const stmt = db.prepare(`
      INSERT INTO ideas (
        id, titulo, descripcion_markdown, categoria, alcance_tipo, alcance_detalle,
        estado, iniciativa_existente_url, es_anonimo, email_creador, verificado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      dto.titulo,
      dto.descripcionMarkdown,
      dto.categoria,
      alcanceTipo,
      dto.alcanceDetalle ?? null,
      estado,
      dto.iniciativaExistenteUrl ?? null,
      esAnonimo ? 1 : 0,
      dto.emailCreador ?? null,
      verificado ? 1 : 0
    );

    const created = this.findById(id, db);
    if (!created) {
      throw new Error('Fallo al recuperar la idea recién creada');
    }
    return created;
  },

  update(id: string, dto: UpdateIdeaDTO, db: Database.Database = getDb()): Idea {
    const existing = this.findById(id, db);
    if (!existing) {
      throw new NotFoundError(`Idea con ID '${id}' no encontrada`);
    }

    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.titulo !== undefined) {
      fields.push('titulo = ?');
      params.push(dto.titulo);
    }
    if (dto.descripcionMarkdown !== undefined) {
      fields.push('descripcion_markdown = ?');
      params.push(dto.descripcionMarkdown);
    }
    if (dto.categoria !== undefined) {
      fields.push('categoria = ?');
      params.push(dto.categoria);
    }
    if (dto.alcanceTipo !== undefined) {
      fields.push('alcance_tipo = ?');
      params.push(dto.alcanceTipo);
    }
    if (dto.alcanceDetalle !== undefined) {
      fields.push('alcance_detalle = ?');
      params.push(dto.alcanceDetalle);
    }
    if (dto.estado !== undefined) {
      fields.push('estado = ?');
      params.push(dto.estado);
    }
    if (dto.iniciativaExistenteUrl !== undefined) {
      fields.push('iniciativa_existente_url = ?');
      params.push(dto.iniciativaExistenteUrl);
    }
    if (dto.verificado !== undefined) {
      fields.push('verificado = ?');
      params.push(dto.verificado ? 1 : 0);
    }

    if (fields.length === 0) {
      return existing;
    }

    fields.push('actualizado_en = CURRENT_TIMESTAMP');
    params.push(id);

    const stmt = db.prepare(`UPDATE ideas SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return this.findById(id, db)!;
  },

  updateStatus(
    id: string, 
    estado: IdeaEstado, 
    iniciativaExistenteUrl: string | null = null, 
    db: Database.Database = getDb()
  ): Idea {
    return this.update(id, { estado, iniciativaExistenteUrl }, db);
  },

  delete(id: string, db: Database.Database = getDb()): boolean {
    const stmt = db.prepare('DELETE FROM ideas WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  countByEstado(db: Database.Database = getDb()): Record<IdeaEstado, number> {
    const stmt = db.prepare('SELECT estado, COUNT(*) as count FROM ideas GROUP BY estado');
    const rows = stmt.all() as { estado: IdeaEstado; count: number }[];
    
    const counts: Record<IdeaEstado, number> = {
      borrador: 0,
      idea: 0,
      promovida: 0,
      en_accion: 0,
      cerrada: 0,
      redirigida: 0,
    };

    for (const row of rows) {
      if (counts[row.estado] !== undefined) {
        counts[row.estado] = row.count;
      }
    }

    return counts;
  },
};
