import { NextRequest } from 'next/server';
import { getSession } from '../../../../lib/api-auth';
import { UsuarioRepository } from '../../../../db/repositories';
import { AuthService } from '../../../../core/services';
import { apiSuccess, apiError } from '../../../../lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return apiSuccess({ authenticated: false, user: null });
    }

    const user = UsuarioRepository.findById(session.userId);
    if (!user || !user.activo) {
      return apiSuccess({ authenticated: false, user: null });
    }

    // Rolling Session: Generar token renovado con 30 días de vigencia continua
    const refreshedToken = AuthService.createSessionToken({
      userId: user.id,
      email: user.email,
      rol: user.rol,
    }, 30);

    const response = apiSuccess({
      authenticated: true,
      user,
      session: {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
      },
    });

    // Renovar la cookie HttpOnly en cada consulta activa
    response.cookies.set('auth_session', refreshedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 días
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE() {
  try {
    const response = apiSuccess({ message: 'Sesión cerrada exitosamente.' });
    response.cookies.set('auth_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
