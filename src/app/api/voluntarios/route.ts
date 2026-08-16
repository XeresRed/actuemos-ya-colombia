import { NextRequest } from 'next/server';
import { VoluntariadoService } from '../../../core/services';
import { apiSuccess, apiError } from '../../../lib/api-response';
import { checkRateLimit } from '../../../lib/rate-limit';
import { CreateVoluntariadoSchema } from '../../../lib/validations';
import type { TipoVoluntariado, EstadoVoluntariado } from '../../../core/domain/voluntariado';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, { maxRequests: 60, windowSeconds: 60 });
    if (!rate.allowed) {
      return apiError(new Error('Límite de solicitudes excedido.'), 429);
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo') as TipoVoluntariado | null;
    const areaProfesional = searchParams.get('area') || undefined;
    const estadoParam = searchParams.get('estado');
    // Si se pasa 'todos', no filtra por estado. Si no se pasa nada, default 'activo'.
    const estado = estadoParam === 'todos' ? undefined : (estadoParam as EstadoVoluntariado || 'activo');
    const ubicacion = searchParams.get('ubicacion') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = VoluntariadoService.listVolunteering({
      tipo: tipo || undefined,
      areaProfesional,
      estado,
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
      return apiError(new Error('Límite de envíos excedido. Por favor, espere un minuto.'), 429);
    }

    const body = await req.json();
    const validatedData = CreateVoluntariadoSchema.parse(body);

    const voluntariado = await VoluntariadoService.createVolunteering(
      {
        tipo: validatedData.tipo,
        areaProfesional: validatedData.areaProfesional,
        tituloNecesidad: validatedData.tituloNecesidad,
        descripcion: validatedData.descripcion,
        nombreContacto: validatedData.nombreContacto,
        emailContacto: validatedData.emailContacto,
        telefonoContacto: validatedData.telefonoContacto,
        ubicacion: validatedData.ubicacion,
      },
      validatedData.captchaToken
    );

    return apiSuccess({
      voluntariado,
      message: 'Tu registro ha sido enviado exitosamente y se encuentra en revisión por el equipo de moderadores.',
    }, 201);
  } catch (error) {
    return apiError(error);
  }
}
