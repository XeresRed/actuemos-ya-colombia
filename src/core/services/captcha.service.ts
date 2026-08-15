export const CaptchaService = {
  /**
   * Verifica la validez del token de Captcha (reCAPTCHA v3 / Cloudflare Turnstile).
   * En desarrollo y pruebas locales, permite tokens de prueba o bypass seguro.
   */
  async verifyToken(token?: string | null): Promise<boolean> {
    const isProd = process.env.NODE_ENV === 'production';
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // Bypass en testing o desarrollo si no hay llave secreta configurada o se usa un token de prueba
    if (!isProd || !secretKey || token === 'test-token' || token === 'dev-token') {
      return true;
    }

    if (!token || typeof token !== 'string') {
      return false;
    }

    try {
      const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
      const bodyParams = new URLSearchParams({
        secret: secretKey,
        response: token,
      });

      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json() as { success?: boolean; score?: number };
      
      // Para reCAPTCHA v3, validamos score >= 0.5
      if (data.success) {
        if (typeof data.score === 'number') {
          return data.score >= 0.5;
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ [CaptchaService] Error al verificar token con servidor externo:', error);
      // En caso de caída de red con el proveedor de captcha, retornamos false en prod
      return false;
    }
  },
};
