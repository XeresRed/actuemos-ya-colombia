import { AuthService, SessionPayload } from '../core/services/auth.service';
import { UnauthorizedError, ForbiddenError } from '../core/errors';
import type { UsuarioRol } from '../core/domain/usuario';

export function getSession(req: Request): SessionPayload | null {
  // 1. Intentar extraer desde Header Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const payload = AuthService.verifySessionToken(token);
    if (payload) return payload;
  }

  // 2. Intentar extraer desde Cookie auth_session
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const sessionCookie = cookies.find(c => c.startsWith('auth_session='));
    if (sessionCookie) {
      const token = sessionCookie.substring('auth_session='.length);
      const payload = AuthService.verifySessionToken(token);
      if (payload) return payload;
    }
  }

  return null;
}

export function requireAuth(req: Request): SessionPayload {
  const session = getSession(req);
  if (!session) {
    throw new UnauthorizedError('Se requiere una sesión activa de moderador para acceder a este recurso.');
  }
  return session;
}

export function requireRole(req: Request, allowedRoles: UsuarioRol | UsuarioRol[]): SessionPayload {
  const session = requireAuth(req);
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(session.rol)) {
    throw new ForbiddenError(`No cuenta con permisos suficientes (${session.rol}) para realizar esta acción.`);
  }

  return session;
}
