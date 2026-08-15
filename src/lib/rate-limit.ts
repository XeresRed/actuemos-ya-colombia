interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Limpieza periódica cada 5 minutos para mantener la memoria <1 MB
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();
}

export interface RateLimitOptions {
  maxRequests?: number; // Máximo de peticiones permitidas por ventana
  windowSeconds?: number; // Tamaño de la ventana en segundos
}

export function checkRateLimit(
  req: Request,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const maxRequests = options.maxRequests ?? 20;
  const windowMs = (options.windowSeconds ?? 60) * 1000;
  const now = Date.now();

  // Obtener IP del cliente desde headers de proxy (Caddy / Cloudflare)
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '127.0.0.1';

  const key = `${ip}:${new URL(req.url).pathname}`;
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter: retryAfter > 0 ? retryAfter : 1,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
  };
}
