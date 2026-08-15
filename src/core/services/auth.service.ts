import { createHmac, createHash, randomBytes } from 'crypto';
import { AuthRepository, UsuarioRepository } from '../../db/repositories';
import { EmailService } from './email.service';
import { 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError, 
  ValidationError 
} from '../errors';
import type { Usuario, UsuarioRol } from '../domain/usuario';

export interface SessionPayload {
  userId: string;
  email: string;
  rol: UsuarioRol;
  exp: number;
}

const DEFAULT_SECRET = 'actuemos-ya-colombia-secret-key-2026-humanitarian-platform';

export const AuthService = {
  /**
   * Genera un código OTP numérico aleatorio de 6 dígitos.
   */
  generateOtpCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code.toString();
  },

  /**
   * Genera un hash SHA256 seguro para tokens u OTPs.
   */
  hashToken(token: string): string {
    return createHash('sha256').update(token.trim()).digest('hex');
  },

  /**
   * Genera un token de sesión criptográfico firmado en Base64URL (Stateless).
   */
  createSessionToken(payload: Omit<SessionPayload, 'exp'>, expiresInDays = 7): string {
    const secret = process.env.SESSION_SECRET || DEFAULT_SECRET;
    const exp = Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60);
    const data: SessionPayload = { ...payload, exp };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(data)).toString('base64url');
    const signature = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');

    return `${header}.${body}.${signature}`;
  },

  /**
   * Verifica la validez y firma de un token de sesión.
   */
  verifySessionToken(token: string): SessionPayload | null {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [header, body, signature] = parts;
    const secret = process.env.SESSION_SECRET || DEFAULT_SECRET;
    const expectedSignature = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    try {
      const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as SessionPayload;
      const now = Math.floor(Date.now() / 1000);

      if (data.exp && data.exp < now) {
        return null; // Token expirado
      }

      return data;
    } catch {
      return null;
    }
  },

  /**
   * Genera y envía un código OTP para verificar una propuesta ciudadana.
   */
  async requestOtpForIdea(email: string, ideaId: string, ideaTitle: string): Promise<string> {
    const cleanEmail = email.trim().toLowerCase();
    const otpCode = this.generateOtpCode();
    const codigoHash = this.hashToken(otpCode);
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

    // Invalidar tokens previos para esta misma idea/correo
    AuthRepository.invalidatePreviousTokens(cleanEmail, 'verificacion_idea');

    AuthRepository.createToken({
      email: cleanEmail,
      codigoHash,
      tipo: 'verificacion_idea',
      referenciaId: ideaId,
      expiraEn,
    });

    await EmailService.sendOtpEmail(cleanEmail, otpCode, ideaTitle);
    return otpCode;
  },

  /**
   * Verifica el OTP ingresado por el ciudadano para una idea.
   */
  async verifyIdeaOtp(email: string, otpCode: string, ideaId: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const codigoHash = this.hashToken(otpCode);

    const token = AuthRepository.findValidToken(cleanEmail, codigoHash, 'verificacion_idea');
    if (!token || token.referenciaId !== ideaId) {
      throw new ValidationError('Código OTP inválido o expirado. Por favor, solicite uno nuevo.');
    }

    AuthRepository.markTokenAsUsed(token.id);
    return true;
  },

  /**
   * Solicita el envío de un Magic Link para administradores y supervisores.
   */
  async requestMagicLink(email: string, appDomain = 'http://localhost:3000'): Promise<{ sent: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    const user = UsuarioRepository.findByEmail(cleanEmail);

    // Seguridad por diseño: si el usuario no existe, simulamos éxito para evitar enumeración de cuentas
    if (!user) {
      console.log(`[AuthService] Magic link solicitado para correo no registrado: ${cleanEmail}`);
      return { sent: true };
    }

    if (!user.activo) {
      throw new ForbiddenError('Su cuenta de moderador se encuentra pendiente de activación por un Administrador.');
    }

    const rawToken = randomBytes(32).toString('hex');
    const codigoHash = this.hashToken(rawToken);
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

    AuthRepository.invalidatePreviousTokens(cleanEmail, 'login_admin');

    AuthRepository.createToken({
      email: cleanEmail,
      codigoHash,
      tipo: 'login_admin',
      referenciaId: user.id,
      expiraEn,
    });

    const magicLinkUrl = `${appDomain}/api/auth/magic-link/verify?email=${encodeURIComponent(cleanEmail)}&token=${encodeURIComponent(rawToken)}`;
    await EmailService.sendMagicLinkEmail(cleanEmail, magicLinkUrl, user.nombre);

    return { sent: true };
  },

  /**
   * Verifica un Magic Link recibido y genera la sesión administrativa.
   */
  async verifyMagicLink(email: string, rawToken: string): Promise<{ sessionToken: string; user: Usuario }> {
    const cleanEmail = email.trim().toLowerCase();
    const codigoHash = this.hashToken(rawToken);

    const token = AuthRepository.findValidToken(cleanEmail, codigoHash, 'login_admin');
    if (!token) {
      throw new UnauthorizedError('El enlace mágico es inválido, ya ha sido utilizado o ha expirado.');
    }

    const user = UsuarioRepository.findByEmail(cleanEmail);
    if (!user || !user.activo) {
      throw new ForbiddenError('Usuario no encontrado o inactivo.');
    }

    AuthRepository.markTokenAsUsed(token.id);

    const sessionToken = this.createSessionToken({
      userId: user.id,
      email: user.email,
      rol: user.rol,
    });

    return {
      sessionToken,
      user,
    };
  },
};
