import { NextRequest } from 'next/server';
import { IdeaService } from '../../../../../core/services';
import { apiSuccess, apiError } from '../../../../../lib/api-response';
import { checkRateLimit } from '../../../../../lib/rate-limit';
import { VerifyIdeaOtpSchema } from '../../../../../lib/validations';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rate = checkRateLimit(req, { maxRequests: 10, windowSeconds: 60 });
    if (!rate.allowed) {
      return apiError(new Error('Demasiados intentos de verificación. Intente más tarde.'), 429);
    }

    const body = await req.json();
    const { email, otpCode } = VerifyIdeaOtpSchema.parse(body);

    const verifiedIdea = await IdeaService.verifyIdea(params.id, email, otpCode);
    return apiSuccess({
      verified: true,
      idea: verifiedIdea,
    });
  } catch (error) {
    return apiError(error);
  }
}
