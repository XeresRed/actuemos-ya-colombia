import { NextRequest } from 'next/server';
import { getSession } from '../../../../lib/api-auth';
import { UsuarioRepository } from '../../../../db/repositories';
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

    return apiSuccess({
      authenticated: true,
      user,
      session: {
        userId: session.userId,
        email: session.email,
        rol: session.rol,
        exp: session.exp,
      },
    });
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
