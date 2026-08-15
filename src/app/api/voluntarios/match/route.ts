import { NextRequest } from 'next/server';
import { VoluntariadoService } from '../../../../core/services';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { checkRateLimit } from '../../../../lib/rate-limit';
import { ValidationError } from '../../../../core/errors';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, { maxRequests: 60, windowSeconds: 60 });
    if (!rate.allowed) {
      return apiError(new Error('Límite de solicitudes excedido.'), 429);
    }

    const { searchParams } = new URL(req.url);
    const area = searchParams.get('area');
    const ubicacion = searchParams.get('ubicacion') || undefined;

    if (!area) {
      throw new ValidationError('El parámetro de consulta ?area es obligatorio para el matching de talento.');
    }

    const matches = VoluntariadoService.matchSkills(area, ubicacion);
    return apiSuccess(matches);
  } catch (error) {
    return apiError(error);
  }
}
