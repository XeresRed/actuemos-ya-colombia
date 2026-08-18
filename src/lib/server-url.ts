import { NextRequest } from 'next/server';

/**
 * Obtiene la URL base canónica y segura para correos transaccionales y Magic Links.
 * Neutraliza estrictamente direcciones no enrutables como '0.0.0.0' o IPs internas de contenedores.
 * En producción/staging resuelve a 'https://actuayacolombia.org' (o dominio público configurado).
 * En desarrollo resuelve a 'http://localhost:3000' (o puerto local correspondiente).
 */
export function getAppBaseUrl(req?: NextRequest | Request): string {
  const isProd = process.env.NODE_ENV === 'production';
  const rawEnv = process.env.APP_DOMAIN || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

  // 1. Si existe una variable de entorno explícita
  if (rawEnv && rawEnv.trim()) {
    let clean = rawEnv.trim().replace(/\/+$/, '');

    // Sanitizar 0.0.0.0 o contenedor interno si viene en la variable de entorno
    if (clean.includes('0.0.0.0')) {
      clean = isProd
        ? clean.replace(/0\.0\.0\.0(:\d+)?/g, 'actuayacolombia.org')
        : clean.replace(/0\.0\.0\.0/g, 'localhost');
    }
    if (clean.includes('app:3000') || clean === 'app') {
      clean = isProd ? 'actuayacolombia.org' : 'localhost:3000';
    }

    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      // En desarrollo con localhost, asegurar http://
      if (!isProd && (clean.includes('localhost') || clean.includes('127.0.0.1')) && clean.startsWith('https://')) {
        return clean.replace(/^https:\/\//, 'http://');
      }
      // En producción con dominio público, forzar https://
      if (isProd && clean.startsWith('http://') && !clean.includes('localhost') && !clean.includes('127.0.0.1')) {
        return clean.replace(/^http:\/\//, 'https://');
      }
      return clean;
    }

    const isLocal = clean.includes('localhost') || clean.includes('127.0.0.1');
    const proto = isLocal ? 'http' : 'https';
    return `${proto}://${clean}`;
  }

  // 2. Inspeccionar cabeceras enviadas por el cliente o proxy inverso (Caddy / Cloudflare / Nginx)
  if (req) {
    let host = req.headers.get('x-forwarded-host') || req.headers.get('host');

    if (host && host.trim()) {
      host = host.trim();

      // Neutralizar 0.0.0.0 o nombres de contenedor Docker internos
      if (host.includes('0.0.0.0')) {
        host = isProd
          ? host.replace(/0\.0\.0\.0(:\d+)?/g, 'actuayacolombia.org')
          : host.replace(/0\.0\.0\.0/g, 'localhost');
      }
      if (host.includes('app:3000') || host === 'app') {
        host = isProd ? 'actuayacolombia.org' : 'localhost:3000';
      }

      const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
      const forwardedProto = req.headers.get('x-forwarded-proto');
      const proto = isLocal ? 'http' : (forwardedProto || 'https');

      return `${proto}://${host}`.replace(/\/+$/, '');
    }

    // Fallback de nextUrl.origin si está presente
    if ('nextUrl' in req && (req as NextRequest).nextUrl?.origin) {
      let origin = (req as NextRequest).nextUrl.origin.replace(/\/+$/, '');
      if (origin.includes('0.0.0.0')) {
        origin = isProd
          ? origin.replace(/0\.0\.0\.0(:\d+)?/g, 'actuayacolombia.org')
          : origin.replace(/0\.0\.0\.0/g, 'localhost');
      }
      if (origin.includes('app:3000')) {
        origin = isProd ? 'https://actuayacolombia.org' : 'http://localhost:3000';
      }
      if (!isProd && origin.includes('localhost') && origin.startsWith('https://')) {
        origin = origin.replace(/^https:\/\//, 'http://');
      }
      return origin;
    }
  }

  // 3. Fallback estricto por entorno
  if (isProd) {
    return 'https://actuayacolombia.org';
  }

  return 'http://localhost:3000';
}
