import { NextRequest } from 'next/server';
import { IdeaService } from '../../../core/services';
import { apiSuccess, apiError } from '../../../lib/api-response';
import { checkRateLimit } from '../../../lib/rate-limit';
import { CreateIdeaSchema } from '../../../lib/validations';
import { getSession } from '../../../lib/api-auth';
import type { AlcanceTipo, IdeaEstado } from '../../../core/domain/idea';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, { maxRequests: 60, windowSeconds: 60 });
    if (!rate.allowed) {
      return apiError(new Error('Límite de solicitudes excedido. Intente en unos momentos.'), 429);
    }

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado') as IdeaEstado | null;
    const categoria = searchParams.get('categoria') || undefined;
    const alcanceTipo = searchParams.get('alcanceTipo') as AlcanceTipo | null;
    const search = searchParams.get('search') || searchParams.get('q') || undefined;
    const limitParam = searchParams.get('limit') ? Math.max(1, parseInt(searchParams.get('limit')!, 10)) : 20;
    const pageParam = searchParams.get('page') ? Math.max(1, parseInt(searchParams.get('page')!, 10)) : 1;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : (pageParam - 1) * limitParam;
    const order = (searchParams.get('order')?.toLowerCase() === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

    // Si el usuario no es moderador/admin, por defecto no ve borradores ajenos
    const session = getSession(req);
    const estadosPermitidos: IdeaEstado[] = estado 
      ? [estado]
      : (session ? ['borrador', 'idea', 'promovida', 'en_accion', 'cerrada', 'redirigida'] : ['idea', 'promovida', 'en_accion', 'cerrada', 'redirigida']);

    const result = IdeaService.listIdeas({
      estado: estadosPermitidos.length === 1 ? estadosPermitidos[0] : estadosPermitidos,
      categoria,
      alcanceTipo: alcanceTipo || undefined,
      search,
      limit: limitParam,
      offset,
      order,
    });

    const hasMore = offset + result.ideas.length < result.total;

    return apiSuccess({
      ideas: result.ideas,
      total: result.total,
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
      return apiError(new Error('Límite de envíos excedido. Por favor, espere antes de enviar otra propuesta.'), 429);
    }

    const body = await req.json();
    const validatedData = CreateIdeaSchema.parse(body);

    const result = await IdeaService.createIdea(
      {
        titulo: validatedData.titulo,
        descripcionMarkdown: validatedData.descripcionMarkdown,
        categoria: validatedData.categoria,
        alcanceTipo: validatedData.alcanceTipo,
        alcanceDetalle: validatedData.alcanceDetalle,
        iniciativaExistenteUrl: validatedData.iniciativaExistenteUrl,
        esAnonimo: validatedData.esAnonimo,
        emailCreador: validatedData.emailCreador,
      },
      validatedData.captchaToken
    );

    return apiSuccess(result, 201);
  } catch (error) {
    return apiError(error);
  }
}
