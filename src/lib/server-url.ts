import { NextRequest } from 'next/server';

/**
 * Obtiene la URL base absoluta de la aplicación de forma canónica y segura,
 * priorizando variables de entorno y cabeceras de proxy inverso (Caddy / Cloudflare),
 * evitando caídas accidentales a '0.0.0.0' en entornos Dockerizados.
 */
export function getAppBaseUrl(req?: NextRequest | Request): string {
  // 1. Prioridad: Variable de entorno explícita
  const envDomain = process.env.APP_DOMAIN || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envDomain && envDomain.trim()) {
    const cleanDomain = envDomain.trim();
    if (cleanDomain.startsWith('http://') || cleanDomain.startsWith('https://')) {
      return cleanDomain.replace(/\/+$/, '');
    }
    if (cleanDomain.includes('localhost') || cleanDomain.includes('127.0.0.1')) {
      return `http://${cleanDomain}`.replace(/\/+$/, '');
    }
    return `https://${cleanDomain}`.replace(/\/+$/, '');
  }

  // 2. Si se provee request, inspeccionar cabeceras enviadas por el proxy inverso
  if (req) {
    const forwardedHost = req.headers.get('x-forwarded-host');
    const host = forwardedHost || req.headers.get('host');

    if (host && !host.includes('0.0.0.0')) {
      const forwardedProto = req.headers.get('x-forwarded-proto');
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
      const proto = forwardedProto || (isLocal ? 'http' : 'https');
      return `${proto}://${host}`.replace(/\/+$/, '');
    }

    // 3. Fallback de nextUrl.origin si está presente y no contiene 0.0.0.0
    if ('nextUrl' in req && (req as NextRequest).nextUrl?.origin && !(req as NextRequest).nextUrl.origin.includes('0.0.0.0')) {
      return (req as NextRequest).nextUrl.origin.replace(/\/+$/, '');
    }
  }

  // 4. Fallback por entorno
  if (process.env.NODE_ENV === 'production') {
    return 'https://actuayacolombia.org';
  }

  return 'http://localhost:3000';
}
