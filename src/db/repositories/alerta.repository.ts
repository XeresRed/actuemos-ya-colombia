import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import { getDb } from '../client';
import type { 
  AlertaSistema, 
  CreateAlertaDTO, 
  UpdateAlertaDTO, 
  NivelAlerta 
} from '../../core/domain/alerta';
import { NotFoundError } from '../../core/errors';

interface AlertaRow {
  id: string;
  nivel: NivelAlerta;
  mensaje: string;
  activa: number;
  enlace_accion_url: string | null;
  enlace_accion_texto: string | null;
  actualizado_por: string | null;
  actualizado_en: string;
}

function mapRowToAlerta(row: AlertaRow): AlertaSistema {
  return {
    id: row.id,
    nivel: row.nivel,
    mensaje: row.mensaje,
    activa: Boolean(row.activa),
    enlaceAccionUrl: row.enlace_accion_url,
    enlaceAccionTexto: row.enlace_accion_texto,
    actualizadoPor: row.actualizado_por,
    actualizadoEn: row.actualizado_en,
  };
}

export const AlertaRepository = {
  getActive(db: Database.Database = getDb()): AlertaSistema | null {
    const stmt = db.prepare(`
      SELECT * FROM alertas_sistema 
      WHERE activa = 1 
      ORDER BY actualizado_en DESC, rowid DESC 
      LIMIT 1
    `);
    const row = stmt.get() as AlertaRow | undefined;
    return row ? mapRowToAlerta(row) : null;
  },

  getActiveAlerts(limit = 10, db: Database.Database = getDb()): AlertaSistema[] {
    const stmt = db.prepare(`
      SELECT * FROM alertas_sistema 
      WHERE activa = 1 
      ORDER BY actualizado_en DESC, rowid DESC 
      LIMIT ?
    `);
    const rows = stmt.all(limit) as AlertaRow[];
    return rows.map(mapRowToAlerta);
  },

  findById(id: string, db: Database.Database = getDb()): AlertaSistema | null {
    const stmt = db.prepare('SELECT * FROM alertas_sistema WHERE id = ?');
    const row = stmt.get(id) as AlertaRow | undefined;
    return row ? mapRowToAlerta(row) : null;
  },

  findMany(limit = 50, db: Database.Database = getDb()): AlertaSistema[] {
    const stmt = db.prepare('SELECT * FROM alertas_sistema ORDER BY actualizado_en DESC, rowid DESC LIMIT ?');
    const rows = stmt.all(limit) as AlertaRow[];
    return rows.map(mapRowToAlerta);
  },

  create(dto: CreateAlertaDTO, db: Database.Database = getDb()): AlertaSistema {
    const id = dto.id || randomUUID();
    const nivel: NivelAlerta = dto.nivel || 'critica';
    const activa = dto.activa !== undefined ? (dto.activa ? 1 : 0) : 1;

    const stmt = db.prepare(`
      INSERT INTO alertas_sistema (
        id, nivel, mensaje, activa, enlace_accion_url, enlace_accion_texto, actualizado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      nivel,
      dto.mensaje,
      activa,
      dto.enlaceAccionUrl ?? null,
      dto.enlaceAccionTexto ?? null,
      dto.actualizadoPor ?? null
    );

    const created = this.findById(id, db);
    if (!created) {
      throw new Error('Fallo al recuperar la alerta creada');
    }
    return created;
  },

  update(id: string, dto: UpdateAlertaDTO, db: Database.Database = getDb()): AlertaSistema {
    const existing = this.findById(id, db);
    if (!existing) {
      throw new NotFoundError(`Alerta con ID '${id}' no encontrada`);
    }

    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.nivel !== undefined) {
      fields.push('nivel = ?');
      params.push(dto.nivel);
    }
    if (dto.mensaje !== undefined) {
      fields.push('mensaje = ?');
      params.push(dto.mensaje);
    }
    if (dto.activa !== undefined) {
      fields.push('activa = ?');
      params.push(dto.activa ? 1 : 0);
    }
    if (dto.enlaceAccionUrl !== undefined) {
      fields.push('enlace_accion_url = ?');
      params.push(dto.enlaceAccionUrl);
    }
    if (dto.enlaceAccionTexto !== undefined) {
      fields.push('enlace_accion_texto = ?');
      params.push(dto.enlaceAccionTexto);
    }
    if (dto.actualizadoPor !== undefined) {
      fields.push('actualizado_por = ?');
      params.push(dto.actualizadoPor);
    }

    if (fields.length === 0) {
      return existing;
    }

    fields.push('actualizado_en = CURRENT_TIMESTAMP');
    params.push(id);

    const stmt = db.prepare(`UPDATE alertas_sistema SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return this.findById(id, db)!;
  },

  setActive(id: string, activa: boolean, db: Database.Database = getDb()): AlertaSistema {
    return this.update(id, { activa }, db);
  },

  deactivateAll(db: Database.Database = getDb()): number {
    const stmt = db.prepare('UPDATE alertas_sistema SET activa = 0 WHERE activa = 1');
    const result = stmt.run();
    return result.changes;
  },

  delete(id: string, db: Database.Database = getDb()): boolean {
    const stmt = db.prepare('DELETE FROM alertas_sistema WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },
};
