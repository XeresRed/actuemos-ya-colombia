import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { getDb } from '../client';
import {
  VisitaAnalytics,
  EventoAnalytics,
  TrackVisitDTO,
  TrackEventDTO,
  AnalyticsTimeframe,
  TimeSeriesPoint,
  TopPage,
  TopReferrer,
  TopEventItem,
  DeviceBreakdown,
  NetworkPerformanceSummary,
  LiveTrafficItem,
} from '../../core/domain/analytics';

function getTimeframeClause(timeframe: AnalyticsTimeframe = '24h', column = 'creado_en'): { sql: string; modifier: string } {
  switch (timeframe) {
    case '24h':
      return { sql: `${column} >= datetime('now', '-24 hours')`, modifier: '-24 hours' };
    case '7d':
      return { sql: `${column} >= datetime('now', '-7 days')`, modifier: '-7 days' };
    case '30d':
      return { sql: `${column} >= datetime('now', '-30 days')`, modifier: '-30 days' };
    case 'all':
    default:
      return { sql: '1=1', modifier: '-10 years' };
  }
}

export const AnalyticsRepository = {
  /**
   * Registra una visita / solicitud de red
   */
  recordVisit(data: TrackVisitDTO, db: Database.Database = getDb()): VisitaAnalytics {
    const id = data.id || randomUUID();
    const sessionId = data.sessionId || null;
    const metodo = (data.metodo || 'GET').toUpperCase();
    const codigoEstado = data.codigoEstado ?? 200;
    const tiempoRespuestaMs = data.tiempoRespuestaMs ?? 0;
    const origenReferencia = data.origenReferencia || null;
    const tipoDispositivo = data.tipoDispositivo || 'desktop';
    const navegador = data.navegador || 'desconocido';
    const sistemaOperativo = data.sistemaOperativo || 'desconocido';
    const pais = data.pais || 'Colombia';
    const esPagina = data.esPagina !== undefined ? (data.esPagina ? 1 : 0) : 1;

    const stmt = db.prepare(`
      INSERT INTO analytics_visitas (
        id, session_id, path, metodo, codigo_estado, tiempo_respuesta_ms,
        origen_referencia, tipo_dispositivo, navegador, sistema_operativo,
        pais, ip_hash, es_pagina
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      sessionId,
      data.path,
      metodo,
      codigoEstado,
      tiempoRespuestaMs,
      origenReferencia,
      tipoDispositivo,
      navegador,
      sistemaOperativo,
      pais,
      data.ipHash,
      esPagina
    );

    return {
      id,
      sessionId,
      path: data.path,
      metodo,
      codigoEstado,
      tiempoRespuestaMs,
      origenReferencia,
      tipoDispositivo,
      navegador,
      sistemaOperativo,
      pais,
      ipHash: data.ipHash,
      esPagina: esPagina === 1,
      creadoEn: new Date().toISOString(),
    };
  },

  /**
   * Registra un evento de interacción o conversión
   */
  recordEvent(data: TrackEventDTO, db: Database.Database = getDb()): EventoAnalytics {
    const id = data.id || randomUUID();
    const sessionId = data.sessionId || null;
    const categoria = data.categoria || 'interaccion';
    const etiqueta = data.etiqueta || null;
    const valorNumerico = data.valorNumerico ?? null;
    const metadatosJson = data.metadatos ? JSON.stringify(data.metadatos) : null;

    const stmt = db.prepare(`
      INSERT INTO analytics_eventos (
        id, session_id, nombre_evento, categoria, etiqueta,
        valor_numerico, metadatos_json, path, ip_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      sessionId,
      data.nombreEvento,
      categoria,
      etiqueta,
      valorNumerico,
      metadatosJson,
      data.path,
      data.ipHash
    );

    return {
      id,
      sessionId,
      nombreEvento: data.nombreEvento,
      categoria,
      etiqueta,
      valorNumerico,
      metadatosJson,
      path: data.path,
      ipHash: data.ipHash,
      creadoEn: new Date().toISOString(),
    };
  },

  /**
   * Cuenta visitantes únicos activos en los últimos N minutos (Tiempo Real)
   */
  getActiveUsersNow(minutes = 5, db: Database.Database = getDb()): number {
    const row = db.prepare(`
      SELECT COUNT(DISTINCT ip_hash) as active_users
      FROM analytics_visitas
      WHERE creado_en >= datetime('now', ?)
    `).get(`-${minutes} minutes`) as { active_users: number } | undefined;

    return row?.active_users || 0;
  },

  /**
   * Obtiene KPIs generales para un periodo
   */
  getSummaryKPIs(timeframe: AnalyticsTimeframe = '24h', db: Database.Database = getDb()) {
    const tf = getTimeframeClause(timeframe);

    const visitStats = db.prepare(`
      SELECT 
        COUNT(*) as total_vistas,
        COUNT(DISTINCT ip_hash) as visitantes_unicos,
        AVG(tiempo_respuesta_ms) as latencia_promedio
      FROM analytics_visitas
      WHERE ${tf.sql} AND es_pagina = 1
    `).get() as { total_vistas: number; visitantes_unicos: number; latencia_promedio: number | null } | undefined;

    const eventStats = db.prepare(`
      SELECT COUNT(*) as total_eventos
      FROM analytics_eventos
      WHERE ${tf.sql}
    `).get() as { total_eventos: number } | undefined;

    const activeNow = this.getActiveUsersNow(5, db);

    return {
      totalVistas: visitStats?.total_vistas || 0,
      visitantesUnicos: visitStats?.visitantes_unicos || 0,
      usuariosActivosAhora: activeNow,
      latenciaPromedioMs: Math.round(visitStats?.latencia_promedio || 0),
      totalEventos: eventStats?.total_eventos || 0,
    };
  },

  /**
   * Obtiene serie temporal para gráficos (por hora si 24h, por día si > 24h)
   */
  getTimeSeries(timeframe: AnalyticsTimeframe = '24h', db: Database.Database = getDb()): TimeSeriesPoint[] {
    const isHourly = timeframe === '24h';
    const tf = getTimeframeClause(timeframe);
    const format = isHourly ? '%Y-%m-%d %H:00' : '%Y-%m-%d';

    const rows = db.prepare(`
      SELECT 
        strftime(?, creado_en) as label,
        MIN(creado_en) as timestamp,
        COUNT(*) as visitas,
        COUNT(DISTINCT ip_hash) as visitantes_unicos
      FROM analytics_visitas
      WHERE ${tf.sql} AND es_pagina = 1
      GROUP BY strftime(?, creado_en)
      ORDER BY timestamp ASC
    `).all(format, format) as { label: string; timestamp: string; visitas: number; visitantes_unicos: number }[];

    return rows.map((r) => ({
      label: r.label,
      timestamp: r.timestamp,
      visitas: r.visitas,
      visitantesUnicos: r.visitantes_unicos,
    }));
  },

  /**
   * Obtiene las páginas más visitadas
   */
  getTopPages(limit = 10, timeframe: AnalyticsTimeframe = '24h', db: Database.Database = getDb()): TopPage[] {
    const tf = getTimeframeClause(timeframe);

    const totalRow = db.prepare(`
      SELECT COUNT(*) as total FROM analytics_visitas WHERE ${tf.sql} AND es_pagina = 1
    `).get() as { total: number } | undefined;
    const totalVistas = totalRow?.total || 1;

    const rows = db.prepare(`
      SELECT 
        path,
        COUNT(*) as visitas,
        COUNT(DISTINCT ip_hash) as visitantes_unicos,
        AVG(tiempo_respuesta_ms) as tiempo_promedio
      FROM analytics_visitas
      WHERE ${tf.sql} AND es_pagina = 1
      GROUP BY path
      ORDER BY visitas DESC
      LIMIT ?
    `).all(limit) as { path: string; visitas: number; visitantes_unicos: number; tiempo_promedio: number | null }[];

    return rows.map((r) => ({
      path: r.path,
      visitas: r.visitas,
      visitantesUnicos: r.visitantes_unicos,
      tiempoPromedioMs: Math.round(r.tiempo_promedio || 0),
      porcentaje: Math.round((r.visitas / totalVistas) * 1000) / 10,
    }));
  },

  /**
   * Obtiene las fuentes de tráfico / referencias más comunes
   */
  getTopReferrers(limit = 8, timeframe: AnalyticsTimeframe = '24h', db: Database.Database = getDb()): TopReferrer[] {
    const tf = getTimeframeClause(timeframe);

    const totalRow = db.prepare(`
      SELECT COUNT(*) as total FROM analytics_visitas WHERE ${tf.sql} AND es_pagina = 1
    `).get() as { total: number } | undefined;
    const totalVistas = totalRow?.total || 1;

    const rows = db.prepare(`
      SELECT 
        COALESCE(origen_referencia, 'Directo / Desconocido') as origen,
        COUNT(*) as visitas
      FROM analytics_visitas
      WHERE ${tf.sql} AND es_pagina = 1
      GROUP BY origen
      ORDER BY visitas DESC
      LIMIT ?
    `).all(limit) as { origen: string; visitas: number }[];

    return rows.map((r) => ({
      origen: r.origen,
      visitas: r.visitas,
      porcentaje: Math.round((r.visitas / totalVistas) * 1000) / 10,
    }));
  },

  /**
   * Obtiene desglose de dispositivos, navegadores y sistemas operativos
   */
  getDeviceBreakdown(timeframe: AnalyticsTimeframe = '24h', db: Database.Database = getDb()): DeviceBreakdown {
    const tf = getTimeframeClause(timeframe);

    const totalRow = db.prepare(`
      SELECT COUNT(*) as total FROM analytics_visitas WHERE ${tf.sql} AND es_pagina = 1
    `).get() as { total: number } | undefined;
    const total = totalRow?.total || 1;

    const dispositivosRows = db.prepare(`
      SELECT tipo_dispositivo as tipo, COUNT(*) as cantidad
      FROM analytics_visitas
      WHERE ${tf.sql} AND es_pagina = 1
      GROUP BY tipo_dispositivo
      ORDER BY cantidad DESC
    `).all() as { tipo: string; cantidad: number }[];

    const navegadoresRows = db.prepare(`
      SELECT navegador as nombre, COUNT(*) as cantidad
      FROM analytics_visitas
      WHERE ${tf.sql} AND es_pagina = 1
      GROUP BY navegador
      ORDER BY cantidad DESC
      LIMIT 6
    `).all() as { nombre: string; cantidad: number }[];

    const osRows = db.prepare(`
      SELECT sistema_operativo as nombre, COUNT(*) as cantidad
      FROM analytics_visitas
      WHERE ${tf.sql} AND es_pagina = 1
      GROUP BY sistema_operativo
      ORDER BY cantidad DESC
      LIMIT 6
    `).all() as { nombre: string; cantidad: number }[];

    return {
      dispositivos: dispositivosRows.map((d) => ({
        tipo: d.tipo,
        cantidad: d.cantidad,
        porcentaje: Math.round((d.cantidad / total) * 1000) / 10,
      })),
      navegadores: navegadoresRows.map((n) => ({
        nombre: n.nombre,
        cantidad: n.cantidad,
        porcentaje: Math.round((n.cantidad / total) * 1000) / 10,
      })),
      sistemasOperativos: osRows.map((s) => ({
        nombre: s.nombre,
        cantidad: s.cantidad,
        porcentaje: Math.round((s.cantidad / total) * 1000) / 10,
      })),
    };
  },

  /**
   * Obtiene telemetría de rendimiento y códigos HTTP de red
   */
  getNetworkPerformance(timeframe: AnalyticsTimeframe = '24h', db: Database.Database = getDb()): NetworkPerformanceSummary {
    const tf = getTimeframeClause(timeframe);

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        AVG(tiempo_respuesta_ms) as avg_latencia,
        SUM(CASE WHEN codigo_estado >= 200 AND codigo_estado < 300 THEN 1 ELSE 0 END) as s_2xx,
        SUM(CASE WHEN codigo_estado >= 300 AND codigo_estado < 400 THEN 1 ELSE 0 END) as s_3xx,
        SUM(CASE WHEN codigo_estado >= 400 AND codigo_estado < 500 THEN 1 ELSE 0 END) as s_4xx,
        SUM(CASE WHEN codigo_estado >= 500 THEN 1 ELSE 0 END) as s_5xx
      FROM analytics_visitas
      WHERE ${tf.sql}
    `).get() as {
      total: number;
      avg_latencia: number | null;
      s_2xx: number | null;
      s_3xx: number | null;
      s_4xx: number | null;
      s_5xx: number | null;
    } | undefined;

    // Calcular percentil 95 aproximado
    const p95Row = db.prepare(`
      SELECT tiempo_respuesta_ms
      FROM analytics_visitas
      WHERE ${tf.sql}
      ORDER BY tiempo_respuesta_ms ASC
      LIMIT 1 OFFSET CAST((SELECT COUNT(*) * 0.95 FROM analytics_visitas WHERE ${tf.sql}) AS INTEGER)
    `).get() as { tiempo_respuesta_ms: number } | undefined;

    return {
      totalSolicitudes: stats?.total || 0,
      latenciaPromedioMs: Math.round(stats?.avg_latencia || 0),
      latenciaP95Ms: p95Row?.tiempo_respuesta_ms || Math.round((stats?.avg_latencia || 0) * 1.5),
      codigosEstado: {
        exitos2xx: stats?.s_2xx || 0,
        redirecciones3xx: stats?.s_3xx || 0,
        erroresCliente4xx: stats?.s_4xx || 0,
        erroresServidor5xx: stats?.s_5xx || 0,
      },
    };
  },

  /**
   * Obtiene eventos más disparados y conversiones
   */
  getTopEvents(limit = 8, timeframe: AnalyticsTimeframe = '24h', db: Database.Database = getDb()): TopEventItem[] {
    const tf = getTimeframeClause(timeframe);

    const rows = db.prepare(`
      SELECT 
        nombre_evento,
        categoria,
        COUNT(*) as total,
        COUNT(DISTINCT ip_hash) as usuarios_unicos
      FROM analytics_eventos
      WHERE ${tf.sql}
      GROUP BY nombre_evento, categoria
      ORDER BY total DESC
      LIMIT ?
    `).all(limit) as { nombre_evento: string; categoria: string; total: number; usuarios_unicos: number }[];

    return rows.map((r) => ({
      nombreEvento: r.nombre_evento,
      categoria: r.categoria,
      total: r.total,
      usuariosUnicos: r.usuarios_unicos,
    }));
  },

  /**
   * Stream de tráfico de red reciente en vivo
   */
  getLiveTrafficFeed(limit = 25, db: Database.Database = getDb()): LiveTrafficItem[] {
    const rows = db.prepare(`
      SELECT 
        id, path, metodo, codigo_estado, tiempo_respuesta_ms,
        tipo_dispositivo, navegador, origen_referencia, es_pagina, creado_en
      FROM analytics_visitas
      ORDER BY creado_en DESC
      LIMIT ?
    `).all(limit) as {
      id: string;
      path: string;
      metodo: string;
      codigo_estado: number;
      tiempo_respuesta_ms: number;
      tipo_dispositivo: string;
      navegador: string;
      origen_referencia: string | null;
      es_pagina: number;
      creado_en: string;
    }[];

    return rows.map((r) => ({
      id: r.id,
      path: r.path,
      metodo: r.metodo,
      codigoEstado: r.codigo_estado,
      tiempoRespuestaMs: r.tiempo_respuesta_ms,
      tipoDispositivo: r.tipo_dispositivo,
      navegador: r.navegador,
      origenReferencia: r.origen_referencia,
      esPagina: r.es_pagina === 1,
      creadoEn: r.creado_en,
    }));
  },
};

export default AnalyticsRepository;
