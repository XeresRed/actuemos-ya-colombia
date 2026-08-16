import { NextRequest } from 'next/server';
import { UsuarioRepository } from '../../../../db/repositories';
import { AuthService } from '../../../../core/services';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { ForbiddenError, NotFoundError } from '../../../../core/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Solo disponible en entornos de desarrollo y pruebas locales
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenError('El acceso rápido de desarrollo no está permitido en producción.');
    }

    const defaultAdminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@actuemosya.org').trim().toLowerCase();
    let admin = UsuarioRepository.findByEmail(defaultAdminEmail);

    if (!admin) {
      // Si no existiera en la DB local, lo creamos
      admin = UsuarioRepository.create({
        email: defaultAdminEmail,
        nombre: 'Administrador General',
        rol: 'admin',
        activo: true,
      });
    }

    const sessionToken = AuthService.createSessionToken({
      userId: admin.id,
      email: admin.email,
      rol: admin.rol,
    }, 30); // 30 días

    const response = apiSuccess({
      sessionToken,
      user: admin,
      message: 'Sesión administrativa de desarrollo iniciada con éxito.',
    });

    response.cookies.set('auth_session', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
