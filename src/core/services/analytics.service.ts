import { createHash } from 'crypto';
import { AnalyticsRepository } from '../../db/repositories/analytics.repository';
import {
  TrackVisitDTO,
  TrackEventDTO,
  AnalyticsTimeframe,
  AnalyticsDashboardData,
  TipoDispositivo,
} from '../domain/analytics';
import { ForbiddenError, UnauthorizedError } from '../errors';

// Sal secreta en memoria para rotación de privacidad diaria
const DAILY_SALT = process.env.SESSION_SECRET || 'actuemosya-analytics-salt-2026';

export const AnalyticsService = {
  /**
   * Genera un hash criptográfico anónimo truncado para la dirección IP.
   * Cumple estrictamente con regulaciones de privacidad (Habeas Data / GDPR).
   */
  anonymizeIp(ip: string | null | undefined): string {
    const rawIp = (ip || '127.0.0.1').trim().replace(/::ffff:/, '');
    const today = new Date().toISOString().slice(0, 10); // Rotación diaria
    return createHash('sha256')
      .update(`${DAILY_SALT}-${today}-${rawIp}`)
      .digest('hex')
      .slice(0, 16);
  },

  /**
   * Identifica el tipo de dispositivo a partir del User-Agent
   */
  parseDeviceType(userAgent: string = ''): TipoDispositivo {
    const ua = userAgent.toLowerCase();
    if (/bot|crawler|spider|crawling|slurp|facebookexternalhit|whatsapp/i.test(ua)) {
      return 'bot';
    }
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini|mobile safari/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  },

  /**
   * Identifica el navegador web a partir del User-Agent
   */
  parseBrowser(userAgent: string = ''): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('edg/') || ua.includes('edge/')) return 'Microsoft Edge';
    if (ua.includes('opr/') || ua.includes('opera/')) return 'Opera';
    if (ua.includes('chrome/') && !ua.includes('chromium')) return 'Google Chrome';
    if (ua.includes('safari/') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('firefox/')) return 'Mozilla Firefox';
    if (ua.includes('brave')) return 'Brave';
    if (ua.includes('bot') || ua.includes('spider')) return 'Bot / Rastreador';
    return 'Navegador Web';
  },

  /**
   * Identifica el sistema operativo a partir del User-Agent
   */
  parseOperatingSystem(userAgent: string = ''): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) return 'iOS';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('cros')) return 'ChromeOS';
    return 'Otro';
  },

  /**
   * Normaliza y agrupa el origen de tráfico (Referrer)
   */
  normalizeReferrer(referrer: string | null | undefined, currentHost = 'actuemosya.org'): string {
    if (!referrer || referrer.trim() === '') {
      return 'Directo / Orgánico';
    }

    try {
      const url = new URL(referrer);
      const host = url.hostname.toLowerCase();

      if (host.includes(currentHost) || host === 'localhost' || host === '127.0.0.1') {
        return 'Directo / Navegación Interna';
      }
      if (host.includes('google.')) return 'Google Search';
      if (host.includes('whatsapp') || host === 'wa.me') return 'WhatsApp';
      if (host.includes('t.co') || host.includes('twitter.com') || host.includes('x.com')) return 'X (Twitter)';
      if (host.includes('facebook.com') || host.includes('fb.me') || host.includes('m.facebook.com')) return 'Facebook';
      if (host.includes('instagram.com')) return 'Instagram';
      if (host.includes('t.me') || host.includes('telegram.org')) return 'Telegram';
      if (host.includes('cruzrojacolombiana.org') || host.includes('cruzroja.org')) return 'Cruz Roja Colombiana';
      if (host.includes('gestiondelriesgo.gov.co') || host.includes('ungrd.gov.co')) return 'UNGRD Oficial';

      return host.replace(/^www\./, '');
    } catch {
      return 'Enlace Externo';
    }
  },

  /**
   * Registra una visita o métrica de red
   */
  async trackVisit(data: {
    path: string;
    sessionId?: string | null;
    metodo?: string;
    codigoEstado?: number;
    tiempoRespuestaMs?: number;
    referrer?: string | null;
    userAgent?: string;
    ip?: string | null;
    pais?: string;
    esPagina?: boolean;
  }) {
    const ipHash = this.anonymizeIp(data.ip);
    const tipoDispositivo = this.parseDeviceType(data.userAgent);
    const navegador = this.parseBrowser(data.userAgent);
    const sistemaOperativo = this.parseOperatingSystem(data.userAgent);
    const origenReferencia = this.normalizeReferrer(data.referrer);

    const dto: TrackVisitDTO = {
      sessionId: data.sessionId,
      path: data.path.trim(),
      metodo: data.metodo || 'GET',
      codigoEstado: data.codigoEstado ?? 200,
      tiempoRespuestaMs: data.tiempoRespuestaMs ?? 0,
      origenReferencia,
      tipoDispositivo,
      navegador,
      sistemaOperativo,
      pais: data.pais || 'Colombia',
      ipHash,
      esPagina: data.esPagina !== undefined ? data.esPagina : true,
    };

    return AnalyticsRepository.recordVisit(dto);
  },

  /**
   * Registra un evento de interacción o conversión personalizado
   */
  async trackEvent(data: {
    nombreEvento: string;
    path: string;
    sessionId?: string | null;
    categoria?: 'conversion' | 'interaccion' | 'emergencia' | 'navegacion';
    etiqueta?: string | null;
    valorNumerico?: number | null;
    metadatos?: Record<string, any> | null;
    ip?: string | null;
  }) {
    const ipHash = this.anonymizeIp(data.ip);

    const dto: TrackEventDTO = {
      sessionId: data.sessionId,
      nombreEvento: data.nombreEvento.trim(),
      categoria: data.categoria || 'interaccion',
      etiqueta: data.etiqueta || null,
      valorNumerico: data.valorNumerico ?? null,
      metadatos: data.metadatos || null,
      path: data.path.trim(),
      ipHash,
    };

    return AnalyticsRepository.recordEvent(dto);
  },

  /**
   * Retorna el conjunto completo de analíticas para el panel administrativo (Exclusivo Administrador)
   */
  getDashboardAnalytics(timeframe: AnalyticsTimeframe = '24h', userRole?: string): AnalyticsDashboardData {
    if (!userRole) {
      throw new UnauthorizedError('Se requiere autenticación para consultar analíticas.');
    }
    if (userRole !== 'admin') {
      throw new ForbiddenError('Acceso a analíticas restringido exclusivamente a Administradores Generales.');
    }

    const kpis = AnalyticsRepository.getSummaryKPIs(timeframe);
    const timeSeries = AnalyticsRepository.getTimeSeries(timeframe);
    const topPages = AnalyticsRepository.getTopPages(10, timeframe);
    const topReferrers = AnalyticsRepository.getTopReferrers(8, timeframe);
    const topEvents = AnalyticsRepository.getTopEvents(8, timeframe);
    const devices = AnalyticsRepository.getDeviceBreakdown(timeframe);
    const network = AnalyticsRepository.getNetworkPerformance(timeframe);
    const liveFeed = AnalyticsRepository.getLiveTrafficFeed(20);

    return {
      timeframe,
      kpis,
      timeSeries,
      topPages,
      topReferrers,
      topEvents,
      devices,
      network,
      liveFeed,
    };
  },

  /**
   * Retorna el pulso de tráfico en tiempo real (visitantes activos y stream en vivo - Exclusivo Administrador)
   */
  getRealtimePulse(userRole?: string) {
    if (!userRole) {
      throw new UnauthorizedError('Se requiere autenticación para consultar telemetría en tiempo real.');
    }
    if (userRole !== 'admin') {
      throw new ForbiddenError('Acceso a telemetría en tiempo real restringido exclusivamente a Administradores Generales.');
    }

    const activeUsersNow = AnalyticsRepository.getActiveUsersNow(5);
    const liveFeed = AnalyticsRepository.getLiveTrafficFeed(15);

    return {
      activeUsersNow,
      liveFeed,
      timestamp: new Date().toISOString(),
    };
  },
};

export default AnalyticsService;
