import { NextRequest } from 'next/server';
import { IdeaService } from '../../../../../core/services';
import { apiSuccess, apiError } from '../../../../../lib/api-response';
import { checkRateLimit } from '../../../../../lib/rate-limit';
import { CreateComentarioSchema } from '../../../../../lib/validations';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rate = checkRateLimit(req, { maxRequests: 20, windowSeconds: 60 });
    if (!rate.allowed) {
      return apiError(new Error('Límite de comentarios excedido. Espere un momento antes de publicar otro.'), 429);
    }

    const body = await req.json();
    const validatedData = CreateComentarioSchema.parse({
      ...body,
      ideaId: params.id,
    });

    const comentario = await IdeaService.addComment(
      {
        ideaId: params.id,
        comentarioPadreId: validatedData.comentarioPadreId,
        contenidoMarkdown: validatedData.contenidoMarkdown,
        esAnonimo: validatedData.esAnonimo,
        autorEmail: validatedData.autorEmail,
      },
      validatedData.captchaToken
    );

    return apiSuccess(comentario, 201);
  } catch (error) {
    return apiError(error);
  }
}
