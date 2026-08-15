import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../../core/services';
import { apiSuccess, apiError } from '../../../../../lib/api-response';
import { VerifyMagicLinkSchema } from '../../../../../lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    const validated = VerifyMagicLinkSchema.parse({ email, token });
    const { sessionToken } = await AuthService.verifyMagicLink(validated.email, validated.token);

    // Redirección directa al panel administrativo con Cookie HttpOnly segura
    const redirectUrl = new URL('/admin', req.url);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set('auth_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });

    return response;
  } catch (error) {
    // Si hay error en el clic del navegador, redirigimos a login con query error
    const loginUrl = new URL('/admin/login?error=invalid_or_expired_link', req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = VerifyMagicLinkSchema.parse(body);

    const { sessionToken, user } = await AuthService.verifyMagicLink(validated.email, validated.token);

    const response = apiSuccess({
      sessionToken,
      user,
    });

    response.cookies.set('auth_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
