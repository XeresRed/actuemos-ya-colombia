import { createHmac, createHash, randomBytes } from 'crypto';
import { AuthRepository, UsuarioRepository } from '../../db/repositories';
import { EmailService } from './email.service';
import { CaptchaService } from './captcha.service';
import { SanitizeService } from './sanitize.service';
import { 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError, 
  ValidationError,
  ConflictError 
} from '../errors';
import type { Usuario, UsuarioRol } from '../domain/usuario';

export interface SessionPayload {
  userId: string;
  email: string;
  rol: UsuarioRol;
  exp: number;
}

export interface RegisterSupervisorDTO {
  nombre: string;
  email: string;
  organizacion?: string | null;
  motivacion: string;
}

const DEFAULT_SECRET = 'actuemos-ya-colombia-secret-key-2026-humanitarian-platform';

// Mapa en memoria para el cooldown de 5 minutos de Magic Links por correo
const magicLinkCooldowns = new Map<string, number>();

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
   * Genera un token de sesión criptográfico firmado en Base64URL (Stateless) con 30 días de vigencia.
   */
  createSessionToken(payload: Omit<SessionPayload, 'exp'>, expiresInDays = 30): string {
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
   * Registra una postulación de nuevo supervisor (queda en activo = 0).
   */
  async registerSupervisor(dto: RegisterSupervisorDTO, captchaToken?: string): Promise<{ user: Usuario; isNew: boolean }> {
    const isCaptchaValid = await CaptchaService.verifyToken(captchaToken);
    if (!isCaptchaValid) {
      throw new ValidationError('Validación de seguridad anti-bot fallida.');
    }

    const cleanEmail = dto.email.trim().toLowerCase();
    const cleanNombre = SanitizeService.sanitizePlainText(dto.nombre);

    const existing = UsuarioRepository.findByEmail(cleanEmail);
    if (existing) {
      if (existing.activo) {
        throw new ConflictError('Ya existe una cuenta activa con este correo electrónico. Por favor, inicia sesión directamente.');
      }
      return { user: existing, isNew: false };
    }

    const user = UsuarioRepository.create({
      nombre: cleanNombre,
      email: cleanEmail,
      rol: 'supervisor',
      activo: false, // Inactivo hasta que un Admin lo apruebe
    });

    return { user, isNew: true };
  },

  /**
   * Aprueba y activa a un supervisor pendiente, enviándole su Magic Link de bienvenida.
   */
  async approveSupervisor(userId: string, appDomain = 'http://localhost:3000', adminRole?: UsuarioRol): Promise<Usuario> {
    if (adminRole !== 'admin') {
      throw new ForbiddenError('Solo el Administrador General puede aprobar y activar supervisores.');
    }

    const user = UsuarioRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`Usuario con ID '${userId}' no encontrado.`);
    }

    const updatedUser = UsuarioRepository.update(userId, { activo: true });

    // Enviar Magic Link de bienvenida al supervisor recién aprobado
    const rawToken = randomBytes(32).toString('hex');
    const codigoHash = this.hashToken(rawToken);
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    AuthRepository.invalidatePreviousTokens(user.email, 'login_admin');
    AuthRepository.createToken({
      email: user.email,
      codigoHash,
      tipo: 'login_admin',
      referenciaId: user.id,
      expiraEn,
    });

    const magicLinkUrl = `${appDomain}/api/auth/magic-link/verify?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(rawToken)}`;
    await EmailService.sendSupervisorWelcomeEmail(user.email, magicLinkUrl, user.nombre || 'Moderador');

    return updatedUser;
  },

  /**
   * Genera y envía un código OTP para verificar una propuesta ciudadana.
   */
  async requestOtpForIdea(email: string, ideaId: string, ideaTitle: string): Promise<string> {
    const cleanEmail = email.trim().toLowerCase();
    const otpCode = this.generateOtpCode();
    const codigoHash = this.hashToken(otpCode);
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

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
   * Solicita el envío de un Magic Link para administradores y supervisores con Cooldown de 5 min.
   */
  async requestMagicLink(email: string, appDomain = 'http://localhost:3000'): Promise<{ sent: boolean; cooldown?: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    const user = UsuarioRepository.findByEmail(cleanEmail);

    // Si el usuario no existe, simulamos éxito para evitar enumeración
    if (!user) {
      console.log(`[AuthService] Magic link solicitado para correo no registrado: ${cleanEmail}`);
      return { sent: true };
    }

    if (!user.activo) {
      throw new ForbiddenError('Su postulación como moderador se encuentra pendiente de aprobación por el Administrador General.');
    }

    // Comprobar Cooldown anti-spam (5 minutos)
    const now = Date.now();
    const lastRequest = magicLinkCooldowns.get(cleanEmail);
    if (lastRequest && (now - lastRequest) < 5 * 60 * 1000) {
      const waitSeconds = Math.ceil((5 * 60 * 1000 - (now - lastRequest)) / 1000);
      console.log(`[AuthService] Cooldown activo para ${cleanEmail}. Reintentar en ${waitSeconds}s.`);
      // Retornamos sent: true para no alertar a bots y no consumir cuota SMTP duplicada
      return { sent: true, cooldown: true };
    }

    magicLinkCooldowns.set(cleanEmail, now);

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
   * Verifica un Magic Link recibido y genera la sesión administrativa de 30 días.
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
      throw new ForbiddenError('Usuario no encontrado o pendiente de activación.');
    }

    AuthRepository.markTokenAsUsed(token.id);

    const sessionToken = this.createSessionToken({
      userId: user.id,
      email: user.email,
      rol: user.rol,
    }, 30); // 30 días de sesión

    return {
      sessionToken,
      user,
    };
  },
};
