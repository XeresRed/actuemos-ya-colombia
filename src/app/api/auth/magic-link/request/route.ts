import { NextRequest } from 'next/server';
import { AuthService } from '../../../../../core/services';
import { apiSuccess, apiError } from '../../../../../lib/api-response';
import { checkRateLimit } from '../../../../../lib/rate-limit';
import { RequestMagicLinkSchema } from '../../../../../lib/validations';

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, { maxRequests: 5, windowSeconds: 60 });
    if (!rate.allowed) {
      return apiError(new Error('Demasiadas solicitudes de enlace de acceso. Por favor, espere un momento.'), 429);
    }

    const body = await req.json();
    const { email } = RequestMagicLinkSchema.parse(body);

    const appDomain = req.nextUrl.origin;
    const result = await AuthService.requestMagicLink(email, appDomain);

    return apiSuccess({
      message: 'Si el correo electrónico está registrado y autorizado, se ha enviado un Magic Link de acceso.',
      ...result,
    });
  } catch (error) {
    return apiError(error);
  }
}
