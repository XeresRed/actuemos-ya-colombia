import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { TrackBeaconSchema } from '../../../../lib/validations';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de baliza de telemetría (Beacon / Telemetry Endpoint)
 * Diseñado para ser no bloqueante y de latencia ultra-baja (<5ms)
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() 
      || req.headers.get('x-real-ip') 
      || req.headers.get('cf-connecting-ip')
      || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    let body: any = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const parsed = TrackBeaconSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD' }, { status: 400 });
    }

    const data = parsed.data;

    if (data.type === 'event' && data.nombreEvento) {
      await AnalyticsService.trackEvent({
        nombreEvento: data.nombreEvento,
        path: data.path,
        sessionId: data.sessionId,
        categoria: data.categoria,
        etiqueta: data.etiqueta,
        valorNumerico: data.valorNumerico,
        metadatos: data.metadatos,
        ip,
      });
    } else {
      await AnalyticsService.trackVisit({
        path: data.path,
        sessionId: data.sessionId,
        metodo: data.metodo,
        codigoEstado: data.codigoEstado,
        tiempoRespuestaMs: data.tiempoRespuestaMs,
        referrer: data.referrer,
        userAgent,
        ip,
        esPagina: data.esPagina,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Las balizas de analítica nunca deben romper la experiencia del usuario
    console.error('[Analytics Tracker Error]', error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
