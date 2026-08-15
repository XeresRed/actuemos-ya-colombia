import { NextRequest } from 'next/server';
import { AlertaService } from '../../../core/services';
import { apiSuccess, apiError } from '../../../lib/api-response';
import { requireAuth } from '../../../lib/api-auth';
import { CreateAlertaSchema } from '../../../lib/validations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activeAlert = AlertaService.getActiveAlert();
    return apiSuccess(activeAlert);
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
