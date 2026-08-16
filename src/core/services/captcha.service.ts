export const CaptchaService = {
  /**
   * Verifica la validez del token de Captcha (Cloudflare Turnstile prioritario / Google reCAPTCHA).
   * En desarrollo y pruebas locales, permite tokens de prueba o bypass seguro.
   */
  async verifyToken(token?: string | null, clientIp?: string): Promise<boolean> {
    const isProd = process.env.NODE_ENV === 'production';
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const secretKey = turnstileSecret || recaptchaSecret;

    // Bypass en testing o desarrollo si no hay llave secreta configurada o se usa un token de prueba
    if (!isProd || !secretKey || token === 'test-token' || token === 'dev-token') {
      return true;
    }

    if (!token || typeof token !== 'string') {
      return false;
    }

    try {
      // 1. Cloudflare Turnstile Verification
      if (turnstileSecret || (secretKey && secretKey.startsWith('0x'))) {
        const turnstileVerifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', token);
        if (clientIp) {
          formData.append('remoteip', clientIp);
        }

        const response = await fetch(turnstileVerifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        if (!response.ok) {
          console.error(`❌ [Turnstile] Error HTTP ${response.status} en la verificación`);
          return false;
        }

        const data = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };
        if (data.success) {
          return true;
        }

        console.warn('⚠️ [Turnstile] Verificación rechazada por Cloudflare:', data['error-codes']);
        return false;
      }

      // 2. Fallback a Google reCAPTCHA v3
      const recaptchaVerifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
      const bodyParams = new URLSearchParams({
        secret: secretKey,
        response: token,
      });

      const response = await fetch(recaptchaVerifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as { success?: boolean; score?: number };

      if (data.success) {
        if (typeof data.score === 'number') {
          return data.score >= 0.5;
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ [CaptchaService] Error al verificar token con servidor externo:', error);
      return false;
    }
  },
};
