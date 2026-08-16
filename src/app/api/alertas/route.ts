import { NextRequest } from 'next/server';
import { AlertaService } from '../../../core/services';
import { apiSuccess, apiError } from '../../../lib/api-response';
import { requireAuth, getSession } from '../../../lib/api-auth';
import { CreateAlertaSchema } from '../../../lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get('all') === 'true';

    if (showAll) {
      const session = requireAuth(req);
      const history = AlertaService.listAlertHistory(50, session.rol);
      return apiSuccess({ alertas: history });
    }

    const activeAlerts = AlertaService.getActiveAlerts();
    return apiSuccess({ alertas: activeAlerts });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const body = await req.json();
    const validatedData = CreateAlertaSchema.parse(body);

    const alert = AlertaService.broadcastAlert(
      validatedData,
      session.rol,
      session.email
    );

    return apiSuccess(alert, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const deactivated = AlertaService.deactivateCurrentAlert(session.rol);
    return apiSuccess({ deactivated });
  } catch (error) {
    return apiError(error);
  }
}
