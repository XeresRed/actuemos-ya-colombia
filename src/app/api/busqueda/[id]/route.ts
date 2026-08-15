import { NextRequest } from 'next/server';
import { BusquedaService } from '../../../../core/services';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { getSession, requireAuth } from '../../../../lib/api-auth';
import { PatchBusquedaSchema } from '../../../../lib/validations';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reporte = BusquedaService.getReport(params.id);
    return apiSuccess(reporte);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSession(req);
    const body = await req.json();
    const { estado, verificar } = PatchBusquedaSchema.parse(body);

    let updated = BusquedaService.getReport(params.id);

    if (estado) {
      updated = await BusquedaService.updateStatus(params.id, estado, session ? session.rol : undefined);
    }

    if (verificar === true) {
      const authSession = requireAuth(req);
      updated = await BusquedaService.verifyReport(params.id, authSession.rol);
    }

    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = requireAuth(req);
    const deleted = BusquedaService.deleteReport(params.id, session.rol);
    return apiSuccess({ deleted });
  } catch (error) {
    return apiError(error);
  }
}
