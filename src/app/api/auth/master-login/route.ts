import { NextRequest } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { UsuarioRepository } from '../../../../db/repositories';
import { AuthService } from '../../../../core/services';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { checkRateLimit } from '../../../../lib/rate-limit';
import { MasterLoginSchema } from '../../../../lib/validations';
import { UnauthorizedError, ForbiddenError } from '../../../../core/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting estricto anti fuerza bruta (5 solicitudes por minuto)
    const rate = checkRateLimit(req, { maxRequests: 5, windowSeconds: 60 });
    if (!rate.allowed) {
      return apiError(new Error('Demasiados intentos de acceso fallidos. Por favor, espere 60 segundos antes de reintentar.'), 429);
    }

    // 2. Validación de entrada
    const body = await req.json();
    const { email, password } = MasterLoginSchema.parse(body);

    const cleanEmail = email.trim().toLowerCase();
    const configuredMasterEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'cam960210@gmail.com').trim().toLowerCase();

    // 3. Verificación de correo exclusivo del usuario master
    if (cleanEmail !== configuredMasterEmail) {
      throw new UnauthorizedError('El correo ingresado no cuenta con acceso por contraseña.');
    }

    // 4. Verificación de contraseña configurada en el entorno
    const configuredMasterPassword = process.env.ADMIN_MASTER_PASSWORD;
    if (!configuredMasterPassword) {
      throw new ForbiddenError('La autenticación por contraseña maestra no está configurada en este entorno.');
    }

    // 5. Comparación criptográfica segura en tiempo constante (timingSafeEqual)
    const inputHash = createHash('sha256').update(password.trim()).digest();
    const expectedHash = createHash('sha256').update(configuredMasterPassword.trim()).digest();

    if (!timingSafeEqual(inputHash, expectedHash)) {
      throw new UnauthorizedError('Contraseña maestra incorrecta.');
    }

    // 6. Obtener o inicializar el usuario administrador en la base de datos
    let admin = UsuarioRepository.findByEmail(cleanEmail);
    if (!admin) {
      admin = UsuarioRepository.create({
        email: cleanEmail,
        nombre: 'Administrador General',
        rol: 'admin',
        activo: true,
      });
    } else if (!admin.activo || admin.rol !== 'admin') {
      admin = UsuarioRepository.update(admin.id, { activo: true, rol: 'admin' });
    }

    // 7. Generar token de sesión firmado para 30 días
    const sessionToken = AuthService.createSessionToken({
      userId: admin.id,
      email: admin.email,
      rol: admin.rol,
    }, 30);

    const response = apiSuccess({
      sessionToken,
      user: admin,
      message: 'Sesión administrativa maestra iniciada con éxito.',
    });

    // 8. Establecer cookie HttpOnly de sesión
    response.cookies.set('auth_session', sessionToken, {
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
