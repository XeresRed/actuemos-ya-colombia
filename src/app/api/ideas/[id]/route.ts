import { NextRequest } from 'next/server';
import { IdeaService } from '../../../../core/services';
import { IdeaRepository } from '../../../../db/repositories';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { requireAuth, requireRole } from '../../../../lib/api-auth';
import { PatchIdeaSchema } from '../../../../lib/validations';
import { ValidationError } from '../../../../core/errors';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = IdeaService.getIdeaWithComments(params.id);
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = requireAuth(req);
    const body = await req.json();
    const { action, iniciativaUrl } = PatchIdeaSchema.parse(body);

    let updatedIdea;
    switch (action) {
      case 'aprobar_borrador':
        updatedIdea = await IdeaService.approveDraft(params.id, session.rol);
        break;
      case 'promover':
        updatedIdea = await IdeaService.promoteIdea(params.id, session.rol);
        break;
      case 'activar':
        updatedIdea = await IdeaService.activateIdea(params.id, session.rol);
        break;
      case 'redirigir':
        if (!iniciativaUrl) {
          throw new ValidationError('La acción redirigir requiere el parámetro iniciativaUrl.');
        }
        updatedIdea = await IdeaService.redirectIdea(params.id, iniciativaUrl, session.rol);
        break;
      case 'cerrar':
        updatedIdea = await IdeaService.closeIdea(params.id, session.rol);
        break;
      default:
        throw new ValidationError(`Acción '${action}' no reconocida.`);
    }

    return apiSuccess(updatedIdea);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, 'admin');
    const deleted = IdeaRepository.delete(params.id);
    return apiSuccess({ deleted });
  } catch (error) {
    return apiError(error);
  }
}
