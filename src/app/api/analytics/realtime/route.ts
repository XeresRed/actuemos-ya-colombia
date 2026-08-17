import { NextRequest } from 'next/server';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { requireAuth } from '../../../../lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const pulseData = AnalyticsService.getRealtimePulse(session.rol);
    return apiSuccess(pulseData);
  } catch (error) {
    return apiError(error);
  }
}
