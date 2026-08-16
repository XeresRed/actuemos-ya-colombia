import { NextRequest } from 'next/server';
import { AlertaService } from '../../../../core/services';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { requireAuth } from '../../../../lib/api-auth';
import { PatchAlertaSchema } from '../../../../lib/validations';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = requireAuth(req);
    const body = await req.json();
    const validatedData = PatchAlertaSchema.parse(body);

    const updated = AlertaService.updateAlert(
      params.id,
      validatedData,
      session.rol,
      session.email
    );

    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = requireAuth(req);
    const deleted = AlertaService.deleteAlert(params.id, session.rol);
    return apiSuccess({ deleted });
  } catch (error) {
    return apiError(error);
  }
}
