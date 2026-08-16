import { NextRequest } from 'next/server';
import { AuthService } from '../../../../core/services';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { checkRateLimit } from '../../../../lib/rate-limit';
import { RegisterSupervisorSchema } from '../../../../lib/validations';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, { maxRequests: 5, windowSeconds: 60 });
    if (!rate.allowed) {
      return apiError(new Error('Límite de solicitudes de registro excedido. Por favor, espere unos minutos.'), 429);
    }

    const body = await req.json();
    const validated = RegisterSupervisorSchema.parse(body);

    const result = await AuthService.registerSupervisor(
      {
        nombre: validated.nombre,
        email: validated.email,
        organizacion: validated.organizacion,
        motivacion: validated.motivacion,
      },
      validated.captchaToken
    );

    return apiSuccess({
      message: result.isNew 
        ? 'Tu postulación como moderador ha sido recibida exitosamente. El Administrador revisará tu solicitud para activar tu cuenta.'
        : 'Tu postulación ya se encuentra registrada y en proceso de revisión.',
      user: {
        id: result.user.id,
        email: result.user.email,
        nombre: result.user.nombre,
        activo: result.user.activo,
      },
    }, 201);
  } catch (error) {
    return apiError(error);
  }
}
