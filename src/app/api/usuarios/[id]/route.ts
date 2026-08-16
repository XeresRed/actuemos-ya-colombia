import { NextRequest } from 'next/server';
import { AuthService } from '../../../../core/services';
import { UsuarioRepository } from '../../../../db/repositories';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { requireRole } from '../../../../lib/api-auth';
import { UpdateUsuarioSchema } from '../../../../lib/validations';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = requireRole(req, 'admin');
    const body = await req.json();
    const validated = UpdateUsuarioSchema.parse(body);

    let updatedUser;

    // Si se está activando a un supervisor pendiente, ejecutamos el flujo de aprobación y bienvenida
    if (validated.activo === true) {
      const appDomain = req.nextUrl.origin;
      updatedUser = await AuthService.approveSupervisor(params.id, appDomain, session.rol);
    } else {
      updatedUser = UsuarioRepository.update(params.id, validated);
    }

    return apiSuccess(updatedUser);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, 'admin');
    const deleted = UsuarioRepository.delete(params.id);
    return apiSuccess({ deleted });
  } catch (error) {
    return apiError(error);
  }
}
