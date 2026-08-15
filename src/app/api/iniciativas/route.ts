import { NextRequest } from 'next/server';
import { IniciativaService } from '../../../core/services';
import { apiSuccess, apiError } from '../../../lib/api-response';
import { checkRateLimit } from '../../../lib/rate-limit';
import { CreateIniciativaSchema } from '../../../lib/validations';
import { getSession } from '../../../lib/api-auth';
import type { IniciativaEstado } from '../../../core/domain/iniciativa';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, { maxRequests: 60, windowSeconds: 60 });
    if (!rate.allowed) {
      return apiError(new Error('Límite de solicitudes excedido.'), 429);
    }

    const { searchParams } = new URL(req.url);
    const soloOficiales = searchParams.get('oficiales') === 'true';

    if (soloOficiales) {
      const oficiales = IniciativaService.getOfficialEntities();
      return apiSuccess(oficiales);
    }

    const categoria = searchParams.get('categoria') || undefined;
    const estadoOperacion = searchParams.get('estadoOperacion') as IniciativaEstado | null;
    const coberturaGeografica = searchParams.get('coberturaGeografica') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = IniciativaService.listInitiatives({
      categoria,
      estadoOperacion: estadoOperacion || undefined,
      coberturaGeografica,
      search,
      limit,
      offset,
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, { maxRequests: 15, windowSeconds: 60 });
    if (!rate.allowed) {
      return apiError(new Error('Límite de envíos excedido.'), 429);
    }

    const session = getSession(req);
    const body = await req.json();
    const validatedData = CreateIniciativaSchema.parse(body);

    const iniciativa = IniciativaService.createInitiative(
      validatedData,
      session ? session.rol : undefined
    );

    return apiSuccess(iniciativa, 201);
  } catch (error) {
    return apiError(error);
  }
}
