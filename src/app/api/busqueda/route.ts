import { NextRequest } from 'next/server';
import { BusquedaService } from '../../../core/services';
import { apiSuccess, apiError } from '../../../lib/api-response';
import { checkRateLimit } from '../../../lib/rate-limit';
import { CreateReporteBusquedaSchema } from '../../../lib/validations';
import type { TipoReporte, EstadoBusqueda } from '../../../core/domain/busqueda';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, { maxRequests: 60, windowSeconds: 60 });
    if (!rate.allowed) {
      return apiError(new Error('Límite de solicitudes excedido.'), 429);
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo') as TipoReporte | null;
    const estado = searchParams.get('estado') as EstadoBusqueda | null;
    const ubicacion = searchParams.get('ubicacion') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = BusquedaService.listReports({
      tipo: tipo || undefined,
      estado: estado || undefined,
      ubicacion,
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

    const body = await req.json();
    const validatedData = CreateReporteBusquedaSchema.parse(body);

    const reporte = await BusquedaService.createReport(
      {
        tipo: validatedData.tipo,
        nombre: validatedData.nombre,
        especie: validatedData.especie,
        descripcionRasgos: validatedData.descripcionRasgos,
        ubicacion: validatedData.ubicacion,
        fotoUrl: validatedData.fotoUrl,
        estado: validatedData.estado,
        contactoEmergencia: validatedData.contactoEmergencia,
      },
      validatedData.captchaToken
    );

    return apiSuccess(reporte, 201);
  } catch (error) {
    return apiError(error);
  }
}
