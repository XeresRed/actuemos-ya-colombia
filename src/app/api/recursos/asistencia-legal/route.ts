import { NextRequest } from 'next/server';
import { LegalService } from '../../../../core/services';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { checkRateLimit } from '../../../../lib/rate-limit';
import { requireRole } from '../../../../lib/api-auth';
import { CreateSolicitudLegalSchema } from '../../../../lib/validations';
import type { SolicitudLegalEstado } from '../../../../core/domain/solicitud-legal';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = requireRole(req, ['admin', 'supervisor']);

    const { searchParams } = new URL(req.url);
    const estadoParam = searchParams.get('estado');
    const estado = (estadoParam && estadoParam !== 'todos' ? estadoParam as SolicitudLegalEstado : undefined);
    const departamento = searchParams.get('departamento') || undefined;
    const municipio = searchParams.get('municipio') || undefined;
    const search = searchParams.get('search') || searchParams.get('q') || undefined;
    const limitParam = searchParams.get('limit') ? Math.max(1, parseInt(searchParams.get('limit')!, 10)) : 20;
    const pageParam = searchParams.get('page') ? Math.max(1, parseInt(searchParams.get('page')!, 10)) : 1;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : (pageParam - 1) * limitParam;
    const order = (searchParams.get('order')?.toLowerCase() === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

    const result = await LegalService.listSolicitudes(
      {
        estado,
        departamento,
        municipio,
        search,
        limit: limitParam,
        offset,
        order,
      },
      user.rol
    );

    const counts = await LegalService.getCounts(user.rol);
    const hasMore = offset + result.solicitudes.length < result.total;

    return apiSuccess({
      solicitudes: result.solicitudes,
      total: result.total,
      counts,
      page: pageParam,
      pageSize: limitParam,
      hasMore,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, { maxRequests: 15, windowSeconds: 60 });
    if (!rate.allowed) {
      return apiError(new Error('Límite de solicitudes excedido. Por favor, espere antes de enviar otra petición.'), 429);
    }

    const body = await req.json();
    const validatedData = CreateSolicitudLegalSchema.parse(body);

    const created = await LegalService.createSolicitud(
      {
        nombreCiudadano: validatedData.nombreCiudadano,
        tipoDocumento: validatedData.tipoDocumento,
        cedulaCiudadano: validatedData.cedulaCiudadano,
        emailContacto: validatedData.emailContacto,
        telefonoContacto: validatedData.telefonoContacto,
        departamento: validatedData.departamento,
        municipio: validatedData.municipio,
        direccionFisica: validatedData.direccionFisica,
        asunto: validatedData.asunto,
        hechos: validatedData.hechos,
        peticiones: validatedData.peticiones,
        anexos: validatedData.anexos,
      },
      validatedData.captchaToken
    );

    return apiSuccess(created, 201);
  } catch (error) {
    return apiError(error);
  }
}
