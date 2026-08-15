import { IdeaRepository, ComentarioRepository } from '../../db/repositories';
import { SanitizeService } from './sanitize.service';
import { CaptchaService } from './captcha.service';
import { AuthService } from './auth.service';
import { 
  NotFoundError, 
  ValidationError, 
  ForbiddenError 
} from '../errors';
import type { 
  Idea, 
  CreateIdeaDTO, 
  UpdateIdeaDTO, 
  IdeaFilter, 
  IdeaEstado 
} from '../domain/idea';
import type { 
  Comentario, 
  ComentarioConRespuestas, 
  CreateComentarioDTO, 
  ComentarioEstado 
} from '../domain/comentario';
import type { UsuarioRol } from '../domain/usuario';

export const IdeaService = {
  /**
   * Registra una nueva propuesta ciudadana (con correo o anónima).
   */
  async createIdea(dto: CreateIdeaDTO, captchaToken?: string): Promise<{ idea: Idea; requiresOtp: boolean }> {
    const isCaptchaValid = await CaptchaService.verifyToken(captchaToken);
    if (!isCaptchaValid) {
      throw new ValidationError('Validación de seguridad anti-bot fallida. Por favor, intente nuevamente.');
    }

    if (!dto.titulo || dto.titulo.trim().length < 5) {
      throw new ValidationError('El título de la propuesta debe tener al menos 5 caracteres.');
    }

    if (!dto.descripcionMarkdown || dto.descripcionMarkdown.trim().length < 15) {
      throw new ValidationError('La descripción de la propuesta debe tener al menos 15 caracteres.');
    }

    const cleanTitle = SanitizeService.sanitizePlainText(dto.titulo);
    const cleanDescription = SanitizeService.sanitizeMarkdown(dto.descripcionMarkdown);
    const cleanDetalle = dto.alcanceDetalle ? SanitizeService.sanitizePlainText(dto.alcanceDetalle) : null;

    const esAnonimo = dto.esAnonimo ?? (dto.emailCreador ? false : true);
    const emailCreador = esAnonimo ? null : (dto.emailCreador ? dto.emailCreador.trim().toLowerCase() : null);

    // Si tiene correo, requiere validación OTP antes de pasar a estado público 'idea'
    const requiresOtp = !esAnonimo && Boolean(emailCreador);

    const createdIdea = IdeaRepository.create({
      titulo: cleanTitle,
      descripcionMarkdown: cleanDescription,
      categoria: dto.categoria || 'General',
      alcanceTipo: dto.alcanceTipo || 'general',
      alcanceDetalle: cleanDetalle,
      estado: 'borrador',
      esAnonimo,
      emailCreador,
      verificado: false,
    });

    if (requiresOtp && emailCreador) {
      await AuthService.requestOtpForIdea(emailCreador, createdIdea.id, createdIdea.titulo);
    }

    return {
      idea: createdIdea,
      requiresOtp,
    };
  },

  /**
   * Verifica el OTP recibido por correo y publica la idea en el muro comunitario.
   */
  async verifyIdea(ideaId: string, email: string, otpCode: string): Promise<Idea> {
    const idea = IdeaRepository.findById(ideaId);
    if (!idea) {
      throw new NotFoundError(`Propuesta con ID '${ideaId}' no encontrada.`);
    }

    await AuthService.verifyIdeaOtp(email, otpCode, ideaId);

    // Transición: borrador -> idea (pública y verificada)
    return IdeaRepository.update(ideaId, {
      estado: 'idea',
      verificado: true,
    });
  },

  /**
   * Aprueba un borrador anónimo (exclusivo para moderadores).
   */
  async approveDraft(ideaId: string, userRole?: UsuarioRol): Promise<Idea> {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden aprobar borradores.');
    }

    const idea = IdeaRepository.findById(ideaId);
    if (!idea) {
      throw new NotFoundError(`Propuesta con ID '${ideaId}' no encontrada.`);
    }

    return IdeaRepository.updateStatus(ideaId, 'idea');
  },

  /**
   * Promueve una idea validada como prioritaria para canalizar recursos/equipos.
   */
  async promoteIdea(ideaId: string, userRole?: UsuarioRol): Promise<Idea> {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden promover propuestas.');
    }

    return IdeaRepository.updateStatus(ideaId, 'promovida');
  },

  /**
   * Pasa una idea a estado 'en_accion' (ejecutándose activamente).
   */
  async activateIdea(ideaId: string, userRole?: UsuarioRol): Promise<Idea> {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden actualizar el estado de ejecución.');
    }

    return IdeaRepository.updateStatus(ideaId, 'en_accion');
  },

  /**
   * Redirige una idea a una solución existente (Anti-Duplicación).
   */
  async redirectIdea(ideaId: string, initiativeUrl: string, userRole?: UsuarioRol): Promise<Idea> {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden redirigir propuestas.');
    }

    if (!initiativeUrl || !initiativeUrl.startsWith('http')) {
      throw new ValidationError('Debe proporcionar una URL válida para la iniciativa existente.');
    }

    return IdeaRepository.updateStatus(ideaId, 'redirigida', initiativeUrl);
  },

  /**
   * Cierra una idea (meta completada o inviable).
   */
  async closeIdea(ideaId: string, userRole?: UsuarioRol): Promise<Idea> {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden cerrar propuestas.');
    }

    return IdeaRepository.updateStatus(ideaId, 'cerrada');
  },

  /**
   * Consulta una idea con su hilo de comentarios jerárquico.
   */
  getIdeaWithComments(id: string): { idea: Idea; comentarios: ComentarioConRespuestas[] } {
    const idea = IdeaRepository.findById(id);
    if (!idea) {
      throw new NotFoundError(`Propuesta con ID '${id}' no encontrada.`);
    }

    const comentarios = ComentarioRepository.findByIdeaId(id, true);
    return { idea, comentarios };
  },

  /**
   * Lista propuestas con filtros y paginación.
   */
  listIdeas(filters: IdeaFilter = {}): { ideas: Idea[]; total: number } {
    return IdeaRepository.findMany(filters);
  },

  /**
   * Agrega un comentario en una idea.
   */
  async addComment(dto: CreateComentarioDTO, captchaToken?: string): Promise<Comentario> {
    const isCaptchaValid = await CaptchaService.verifyToken(captchaToken);
    if (!isCaptchaValid) {
      throw new ValidationError('Validación de seguridad anti-bot fallida.');
    }

    const idea = IdeaRepository.findById(dto.ideaId);
    if (!idea) {
      throw new NotFoundError(`No se puede comentar en una propuesta inexistente.`);
    }

    if (!dto.contenidoMarkdown || dto.contenidoMarkdown.trim().length < 3) {
      throw new ValidationError('El comentario debe tener al menos 3 caracteres.');
    }

    const cleanMarkdown = SanitizeService.sanitizeMarkdown(dto.contenidoMarkdown);

    return ComentarioRepository.create({
      ideaId: dto.ideaId,
      comentarioPadreId: dto.comentarioPadreId ?? null,
      contenidoMarkdown: cleanMarkdown,
      esAnonimo: dto.esAnonimo ?? true,
      autorEmail: dto.autorEmail ? dto.autorEmail.trim().toLowerCase() : null,
      verificado: Boolean(dto.autorEmail),
      estado: 'visible',
    });
  },
};
