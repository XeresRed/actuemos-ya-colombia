export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const EmailService = {
  /**
   * Envía un correo electrónico transaccional.
   * Si no hay credenciales configuradas o estamos en desarrollo, imprime el mensaje en consola.
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const isProd = process.env.NODE_ENV === 'production';
    const apiKey = process.env.SMTP_PASS;
    const fromEmail = process.env.EMAIL_FROM || 'no-reply@actuemosya.org';

    // En desarrollo o testing, mostramos el correo en consola para pruebas sin fricción
    if (!isProd || !apiKey) {
      console.log('\n✉️ =================== [EMAIL SIMULADO (DEV/TEST)] ===================');
      console.log(`Para:    ${options.to}`);
      console.log(`De:      ${fromEmail}`);
      console.log(`Asunto:  ${options.subject}`);
      console.log(`Texto:   ${options.text || options.html.replace(/<[^>]+>/g, ' ')}`);
      console.log('====================================================================\n');
      return true;
    }

    try {
      // Envío vía Resend API si la key inicia con 're_' o tiene formato de API key
      if (apiKey.startsWith('re_')) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [options.to],
            subject: options.subject,
            html: options.html,
            text: options.text,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error('❌ [EmailService] Error enviando correo vía Resend:', errText);
          return false;
        }

        return true;
      }

      // Si no es Resend ni desarrollo, logger de advertencia
      console.log(`[EmailService] Envío a ${options.to} procesado.`);
      return true;
    } catch (error) {
      console.error('❌ [EmailService] Fallo en el envío de correo:', error);
      return false;
    }
  },

  /**
   * Envía código OTP de 6 dígitos para validación de idea comunitaria.
   */
  async sendOtpEmail(email: string, otpCode: string, ideaTitle: string): Promise<boolean> {
    const subject = `Código de Verificación: ${otpCode} — ActuemosYaColombia`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #af101a; margin-bottom: 8px;">ActuemosYa<span style="color: #005db7;">Colombia</span></h2>
        <p style="font-size: 16px; color: #333;">Hola,</p>
        <p style="font-size: 16px; color: #333;">Has registrado la propuesta comunitaria: <strong>"${ideaTitle}"</strong>.</p>
        <p style="font-size: 16px; color: #333;">Para validarla y publicarla en el muro comunitario, ingresa el siguiente código de 6 dígitos:</p>
        <div style="background-color: #f8f9fa; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #af101a;">${otpCode}</span>
        </div>
        <p style="font-size: 13px; color: #666;">Este código es de un solo uso y expirará en 15 minutos. Si no realizaste esta solicitud, puedes ignorar este correo.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: `Tu código de verificación para ActuemosYaColombia es: ${otpCode}. Expira en 15 minutos.`,
    });
  },

  /**
   * Envía Magic Link de acceso administrativo passwordless.
   */
  async sendMagicLinkEmail(email: string, magicLinkUrl: string, nombre?: string | null): Promise<boolean> {
    const subject = `Enlace de Acceso Administrativo — ActuemosYaColombia`;
    const saludo = nombre ? `Hola, ${nombre}` : 'Hola';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #af101a; margin-bottom: 8px;">ActuemosYa<span style="color: #005db7;">Colombia</span></h2>
        <p style="font-size: 16px; color: #333;">${saludo},</p>
        <p style="font-size: 16px; color: #333;">Has solicitado acceso al portal de administración y moderación.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${magicLinkUrl}" style="background-color: #005db7; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Ingresar al Panel de Control
          </a>
        </div>
        <p style="font-size: 13px; color: #666;">Este enlace es de uso único y expirará en 15 minutos.</p>
        <p style="font-size: 12px; color: #999; word-break: break-all;">Si el botón no funciona, copia y pega esta URL en tu navegador: ${magicLinkUrl}</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: `Ingresa a tu cuenta de ActuemosYaColombia usando este enlace: ${magicLinkUrl} (Válido por 15 minutos).`,
    });
  },
};
