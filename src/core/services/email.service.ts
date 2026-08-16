import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const EmailService = {
  /**
   * Envía un correo electrónico transaccional.
   * Prioridad de despacho:
   * 1. Resend API (`RESEND_API_KEY` o `re_...`)
   * 2. MailerSend API (`MAILERSEND_API_KEY` o `mlsn...`)
   * 3. SMTP Directo con Nodemailer (Gmail / Servidor dedicado)
   * 4. Console Logger en desarrollo o testing.
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const isProd = process.env.NODE_ENV === 'production';
    const resendKey = process.env.RESEND_API_KEY;
    const mailerSendKey = process.env.MAILERSEND_API_KEY;
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const apiKey = process.env.SMTP_PASS;
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'onboarding@resend.dev';

    const effectiveResendKey = resendKey || (apiKey && apiKey.startsWith('re_') ? apiKey : null);
    const effectiveMailerSendKey = mailerSendKey || (apiKey && apiKey.startsWith('mlsn.') ? apiKey : null);
    const hasSmtp = Boolean(smtpHost && smtpUser && apiKey);

    // En desarrollo o testing sin credenciales activas, mostramos el correo en consola
    if (!isProd || (!effectiveResendKey && !effectiveMailerSendKey && !hasSmtp)) {
      console.log('\n✉️ =================== [EMAIL SIMULADO (DEV/TEST)] ===================');
      console.log(`Para:    ${options.to}`);
      console.log(`De:      ${fromEmail}`);
      console.log(`Asunto:  ${options.subject}`);
      console.log(`Texto:   ${options.text || options.html.replace(/<[^>]+>/g, ' ')}`);
      console.log('====================================================================\n');
      return true;
    }

    try {
      // 1. Envío prioritario vía Resend API (3,000 correos/mes gratis)
      if (effectiveResendKey) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveResendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [options.to],
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]+>/g, ' '),
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error('❌ [EmailService] Error enviando correo vía Resend:', errText);
          return false;
        }

        return true;
      }

      // 2. Envío vía MailerSend API
      if (effectiveMailerSendKey) {
        const response = await fetch('https://api.mailersend.com/v1/email', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveMailerSendKey}`,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            from: {
              email: fromEmail,
              name: 'ActuemosYa Colombia',
            },
            to: [
              {
                email: options.to,
              },
            ],
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]+>/g, ' '),
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error('❌ [EmailService] Error enviando correo vía MailerSend:', errText);
          return false;
        }

        return true;
      }

      // 3. Envío vía SMTP Real con Nodemailer
      if (hasSmtp && smtpHost && smtpUser && apiKey) {
        const port = parseInt(process.env.SMTP_PORT || '587', 10);
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port,
          secure: port === 465,
          auth: {
            user: smtpUser,
            pass: apiKey,
          },
        });

        await transporter.sendMail({
          from: `"ActuemosYa Colombia" <${fromEmail}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]+>/g, ' '),
        });

        return true;
      }

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

  /**
   * Envía notificación de bienvenida y activación para nuevos supervisores aprobados.
   */
  async sendSupervisorWelcomeEmail(email: string, magicLinkUrl: string, nombre: string): Promise<boolean> {
    const subject = `¡Tu postulación como Supervisor ha sido aprobada! — ActuemosYaColombia`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #af101a; margin-bottom: 8px;">ActuemosYa<span style="color: #005db7;">Colombia</span></h2>
        <p style="font-size: 16px; color: #333;">Hola, <strong>${nombre}</strong>,</p>
        <p style="font-size: 16px; color: #333;">El equipo de administración ha revisado y <strong>aprobado tu postulación</strong> como Moderador/Supervisor humanitario en la plataforma.</p>
        <p style="font-size: 15px; color: #555;">Ahora tienes permisos para revisar propuestas ciudadanas, moderar comentarios, verificar reportes de búsqueda y coordinar iniciativas activas.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${magicLinkUrl}" style="background-color: #005db7; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Ingresar al Panel de Moderación
          </a>
        </div>
        <p style="font-size: 13px; color: #666;">Este enlace de bienvenida expirará en 15 minutos. Gracias por sumarte a la respuesta humanitaria de Colombia.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: `¡Bienvenido a ActuemosYaColombia! Tu cuenta de supervisor ha sido activada. Ingresa usando este enlace: ${magicLinkUrl}`,
    });
  },
};
