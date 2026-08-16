import { NextRequest } from 'next/server';
import { IniciativaService } from '../../../../core/services';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { requireAuth } from '../../../../lib/api-auth';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = requireAuth(req);
    const deleted = IniciativaService.deleteInitiative(params.id, session.rol);
    return apiSuccess({ deleted });
  } catch (error) {
    return apiError(error);
  }
}
