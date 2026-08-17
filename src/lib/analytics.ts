/**
 * Utilidades cliente para telemetría y analítica in-house & sincronización con Google Tag Manager / GA4
 * Privacidad estricta: Sin cookies de terceros invasivas, sincronización automática con dataLayer
 */

let ephemeralSessionId: string | null = null;

export function getAnonymousSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  if (ephemeralSessionId) return ephemeralSessionId;

  try {
    const stored = window.sessionStorage.getItem('ayc_anon_session');
    if (stored) {
      ephemeralSessionId = stored;
      return stored;
    }

    const newId = 's_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    window.sessionStorage.setItem('ayc_anon_session', newId);
    ephemeralSessionId = newId;
    return newId;
  } catch {
    return 'anonymous';
  }
}

/**
 * Registra una vista de página en el sistema In-House y sincroniza con Google Tag Manager (dataLayer)
 */
export function trackPageView(path: string, referrer?: string) {
  if (typeof window === 'undefined') return;

  const currentPath = path || window.location.pathname;
  const currentReferrer = referrer !== undefined ? referrer : document.referrer || null;

  // 1. Envío de baliza In-House (SQLite WAL)
  const payload = {
    type: 'pageview',
    path: currentPath,
    sessionId: getAnonymousSessionId(),
    referrer: currentReferrer,
    esPagina: true,
  };
  sendBeaconPayload(payload);

  // 2. Sincronización con Google Tag Manager / GA4 (solo si el usuario aceptó en el banner)
  try {
    const consent = localStorage.getItem('ayc_cookie_consent');
    if (consent === 'all') {
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        event: 'page_view',
        page_path: currentPath,
        page_referrer: currentReferrer,
      });
    }
  } catch {
    // Ignorar si dataLayer o localStorage no están disponibles
  }
}

/**
 * Registra un evento de interacción o conversión personalizado (In-House + GTM dataLayer)
 */
export function trackEvent(
  nombreEvento: string,
  options?: {
    categoria?: 'conversion' | 'interaccion' | 'emergencia' | 'navegacion';
    etiqueta?: string;
    valorNumerico?: number;
    metadatos?: Record<string, any>;
    path?: string;
  }
) {
  if (typeof window === 'undefined') return;

  const currentPath = options?.path || window.location.pathname;

  // 1. Envío de baliza In-House (SQLite WAL)
  const payload = {
    type: 'event',
    nombreEvento,
    path: currentPath,
    sessionId: getAnonymousSessionId(),
    categoria: options?.categoria || 'interaccion',
    etiqueta: options?.etiqueta || null,
    valorNumerico: options?.valorNumerico ?? null,
    metadatos: options?.metadatos || null,
  };
  sendBeaconPayload(payload);

  // 2. Sincronización con Google Tag Manager / GA4 (solo si el usuario aceptó en el banner)
  try {
    const consent = localStorage.getItem('ayc_cookie_consent');
    if (consent === 'all') {
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        event: nombreEvento,
        event_category: options?.categoria || 'interaccion',
        event_label: options?.etiqueta || undefined,
        value: options?.valorNumerico || undefined,
        page_path: currentPath,
        ...(options?.metadatos || {}),
      });
    }
  } catch {
    // Ignorar si dataLayer no está disponible
  }

}

function sendBeaconPayload(payload: Record<string, any>) {
  try {
    const endpoint = '/api/analytics/track';
    const jsonString = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([jsonString], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonString,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (err) {
    // Falla silenciosa para no degradar el UI
  }
}
