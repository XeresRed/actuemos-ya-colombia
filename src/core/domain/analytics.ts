export type TipoDispositivo = 'mobile' | 'desktop' | 'tablet' | 'bot';

export type CategoriaEvento = 'conversion' | 'interaccion' | 'emergencia' | 'navegacion';

export type AnalyticsTimeframe = '24h' | '7d' | '30d' | 'all';

export interface VisitaAnalytics {
  id: string;
  sessionId: string | null;
  path: string;
  metodo: string;
  codigoEstado: number;
  tiempoRespuestaMs: number;
  origenReferencia: string | null;
  tipoDispositivo: TipoDispositivo;
  navegador: string;
  sistemaOperativo: string;
  pais: string;
  ipHash: string;
  esPagina: boolean;
  creadoEn: string;
}

export interface EventoAnalytics {
  id: string;
  sessionId: string | null;
  nombreEvento: string;
  categoria: CategoriaEvento;
  etiqueta: string | null;
  valorNumerico: number | null;
  metadatosJson: string | null;
  path: string;
  ipHash: string;
  creadoEn: string;
}

export interface TrackVisitDTO {
  id?: string;
  sessionId?: string | null;
  path: string;
  metodo?: string;
  codigoEstado?: number;
  tiempoRespuestaMs?: number;
  origenReferencia?: string | null;
  tipoDispositivo?: TipoDispositivo;
  navegador?: string;
  sistemaOperativo?: string;
  pais?: string;
  ipHash: string;
  esPagina?: boolean;
}

export interface TrackEventDTO {
  id?: string;
  sessionId?: string | null;
  nombreEvento: string;
  categoria?: CategoriaEvento;
  etiqueta?: string | null;
  valorNumerico?: number | null;
  metadatos?: Record<string, any> | null;
  path: string;
  ipHash: string;
}

export interface AnalyticsFilterParams {
  timeframe?: AnalyticsTimeframe;
  path?: string;
  limit?: number;
}

export interface TimeSeriesPoint {
  label: string;
  timestamp: string;
  visitas: number;
  visitantesUnicos: number;
}

export interface TopPage {
  path: string;
  visitas: number;
  visitantesUnicos: number;
  tiempoPromedioMs: number;
  porcentaje: number;
}

export interface TopReferrer {
  origen: string;
  visitas: number;
  porcentaje: number;
}

export interface TopEventItem {
  nombreEvento: string;
  categoria: string;
  total: number;
  usuariosUnicos: number;
}

export interface DeviceBreakdown {
  dispositivos: { tipo: string; cantidad: number; porcentaje: number }[];
  navegadores: { nombre: string; cantidad: number; porcentaje: number }[];
  sistemasOperativos: { nombre: string; cantidad: number; porcentaje: number }[];
}

export interface NetworkPerformanceSummary {
  totalSolicitudes: number;
  latenciaPromedioMs: number;
  latenciaP95Ms: number;
  codigosEstado: {
    exitos2xx: number;
    redirecciones3xx: number;
    erroresCliente4xx: number;
    erroresServidor5xx: number;
  };
}

export interface LiveTrafficItem {
  id: string;
  path: string;
  metodo: string;
  codigoEstado: number;
  tiempoRespuestaMs: number;
  tipoDispositivo: string;
  navegador: string;
  origenReferencia: string | null;
  esPagina: boolean;
  creadoEn: string;
}

export interface AnalyticsDashboardData {
  timeframe: AnalyticsTimeframe;
  kpis: {
    totalVistas: number;
    visitantesUnicos: number;
    usuariosActivosAhora: number;
    latenciaPromedioMs: number;
    totalEventos: number;
  };
  timeSeries: TimeSeriesPoint[];
  topPages: TopPage[];
  topReferrers: TopReferrer[];
  topEvents: TopEventItem[];
  devices: DeviceBreakdown;
  network: NetworkPerformanceSummary;
  liveFeed: LiveTrafficItem[];
}
