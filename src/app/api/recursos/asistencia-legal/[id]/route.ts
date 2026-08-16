import { NextRequest } from 'next/server';
import { LegalService } from '../../../../../core/services';
import { apiSuccess, apiError } from '../../../../../lib/api-response';
import { requireRole } from '../../../../../lib/api-auth';
import { PatchSolicitudLegalSchema } from '../../../../../lib/validations';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = requireRole(req, ['admin', 'supervisor']);
    const solicitud = await LegalService.getSolicitudById(params.id, user.rol);
    return apiSuccess(solicitud);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const user = requireRole(req, ['admin', 'supervisor']);
    const body = await req.json();
    const validatedData = PatchSolicitudLegalSchema.parse(body);

    const updated = await LegalService.updateSolicitud(
      params.id,
      {
        estado: validatedData.estado,
        abogadoAsignado: validatedData.abogadoAsignado,
        notasSeguimiento: validatedData.notasSeguimiento,
      },
      user.rol
    );

    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const user = requireRole(req, 'admin');
    const success = await LegalService.deleteSolicitud(params.id, user.rol);
    return apiSuccess({ deleted: success });
  } catch (error) {
    return apiError(error);
  }
}

