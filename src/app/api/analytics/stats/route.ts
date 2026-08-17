import { NextRequest } from 'next/server';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { apiSuccess, apiError } from '../../../../lib/api-response';
import { requireAuth } from '../../../../lib/api-auth';
import { AnalyticsQuerySchema } from '../../../../lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const timeframeParam = searchParams.get('timeframe') || '24h';

    const parsed = AnalyticsQuerySchema.safeParse({ timeframe: timeframeParam });
    const timeframe = parsed.success ? parsed.data.timeframe : '24h';

    const analyticsData = AnalyticsService.getDashboardAnalytics(timeframe, session.rol);

    return apiSuccess(analyticsData);
  } catch (error) {
    return apiError(error);
  }
}
