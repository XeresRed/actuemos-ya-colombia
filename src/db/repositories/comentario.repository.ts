import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import { getDb } from '../client';
import type { 
  Comentario, 
  ComentarioConRespuestas, 
  CreateComentarioDTO, 
  ComentarioEstado 
} from '../../core/domain/comentario';
import { NotFoundError } from '../../core/errors';

interface ComentarioRow {
  id: string;
  idea_id: string;
  comentario_padre_id: string | null;
  contenido_markdown: string;
  es_anonimo: number;
  autor_email: string | null;
  verificado: number;
  estado: ComentarioEstado;
  creado_en: string;
}

function mapRowToComentario(row: ComentarioRow): Comentario {
  return {
    id: row.id,
    ideaId: row.idea_id,
    comentarioPadreId: row.comentario_padre_id,
    contenidoMarkdown: row.contenido_markdown,
    esAnonimo: Boolean(row.es_anonimo),
    autorEmail: row.autor_email,
    verificado: Boolean(row.verificado),
    estado: row.estado,
    creadoEn: row.creado_en,
  };
}

export const ComentarioRepository = {
  findById(id: string, db: Database.Database = getDb()): Comentario | null {
    const stmt = db.prepare('SELECT * FROM comentarios WHERE id = ?');
    const row = stmt.get(id) as ComentarioRow | undefined;
    return row ? mapRowToComentario(row) : null;
  },

  findByIdeaId(ideaId: string, onlyVisible = true, db: Database.Database = getDb()): ComentarioConRespuestas[] {
    const query = onlyVisible
      ? "SELECT * FROM comentarios WHERE idea_id = ? AND estado = 'visible' ORDER BY creado_en ASC"
      : "SELECT * FROM comentarios WHERE idea_id = ? ORDER BY creado_en ASC";

    const stmt = db.prepare(query);
    const rows = stmt.all(ideaId) as ComentarioRow[];
    const comentarios = rows.map(mapRowToComentario);

    // Build comment tree (nest replies)
    const map = new Map<string, ComentarioConRespuestas>();
    const roots: ComentarioConRespuestas[] = [];

    for (const c of comentarios) {
      map.set(c.id, { ...c, respuestas: [] });
    }

    for (const c of comentarios) {
      const node = map.get(c.id)!;
      if (c.comentarioPadreId && map.has(c.comentarioPadreId)) {
        map.get(c.comentarioPadreId)!.respuestas.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  },

  create(dto: CreateComentarioDTO, db: Database.Database = getDb()): Comentario {
    const id = dto.id || randomUUID();
    const esAnonimo = dto.esAnonimo ?? (dto.autorEmail ? false : true);
    const verificado = dto.verificado ?? false;
    const estado: ComentarioEstado = dto.estado || 'visible';

    const stmt = db.prepare(`
      INSERT INTO comentarios (
        id, idea_id, comentario_padre_id, contenido_markdown, es_anonimo, autor_email, verificado, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      dto.ideaId,
      dto.comentarioPadreId ?? null,
      dto.contenidoMarkdown,
      esAnonimo ? 1 : 0,
      dto.autorEmail ?? null,
      verificado ? 1 : 0,
      estado
    );

    const created = this.findById(id, db);
    if (!created) {
      throw new Error('Fallo al recuperar el comentario creado');
    }
    return created;
  },

  updateEstado(id: string, estado: ComentarioEstado, db: Database.Database = getDb()): Comentario {
    const existing = this.findById(id, db);
    if (!existing) {
      throw new NotFoundError(`Comentario con ID '${id}' no encontrado`);
    }

    const stmt = db.prepare('UPDATE comentarios SET estado = ? WHERE id = ?');
    stmt.run(estado, id);

    return this.findById(id, db)!;
  },

  delete(id: string, db: Database.Database = getDb()): boolean {
    const stmt = db.prepare('DELETE FROM comentarios WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  countByIdeaId(ideaId: string, onlyVisible = true, db: Database.Database = getDb()): number {
    const query = onlyVisible
      ? "SELECT COUNT(*) as count FROM comentarios WHERE idea_id = ? AND estado = 'visible'"
      : "SELECT COUNT(*) as count FROM comentarios WHERE idea_id = ?";
    const stmt = db.prepare(query);
    const result = stmt.get(ideaId) as { count: number };
    return result.count;
  },
};
