import { NextRequest } from 'next/server';
import { VoluntariadoService } from '../../../../core/services';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { requireAuth } from '../../../../lib/api-auth';
import { PatchVoluntariadoSchema } from '../../../../lib/validations';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = requireAuth(req);
    const body = await req.json();
    const validated = PatchVoluntariadoSchema.parse(body);

    const updated = VoluntariadoService.updateStatus(params.id, validated.estado, session.rol);
    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = requireAuth(req);
    const deleted = VoluntariadoService.deleteVolunteering(params.id, session.rol);
    return apiSuccess({ deleted });
  } catch (error) {
    return apiError(error);
  }
}
