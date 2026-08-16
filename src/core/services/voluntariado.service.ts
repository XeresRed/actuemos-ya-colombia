import { VoluntariadoRepository } from '../../db/repositories';
import { SanitizeService } from './sanitize.service';
import { CaptchaService } from './captcha.service';
import { 
  NotFoundError, 
  ValidationError, 
  ForbiddenError 
} from '../errors';
import type { 
  Voluntariado, 
  CreateVoluntariadoDTO, 
  UpdateVoluntariadoDTO, 
  VoluntariadoFilter, 
  EstadoVoluntariado 
} from '../domain/voluntariado';
import type { UsuarioRol } from '../domain/usuario';

export const VoluntariadoService = {
  /**
   * Registra una oferta de habilidad o una solicitud de profesional técnico en estado 'pendiente'.
   */
  async createVolunteering(dto: CreateVoluntariadoDTO, captchaToken?: string): Promise<Voluntariado> {
    const isCaptchaValid = await CaptchaService.verifyToken(captchaToken);
    if (!isCaptchaValid) {
      throw new ValidationError('Validación de seguridad anti-bot fallida.');
    }

    if (!dto.areaProfesional || dto.areaProfesional.trim().length < 3) {
      throw new ValidationError('Debe especificar el área profesional o técnica.');
    }

    if (!dto.tituloNecesidad || dto.tituloNecesidad.trim().length < 5) {
      throw new ValidationError('El título debe tener al menos 5 caracteres.');
    }

    if (!dto.descripcion || dto.descripcion.trim().length < 15) {
      throw new ValidationError('La descripción debe tener al menos 15 caracteres.');
    }

    if (!dto.nombreContacto || dto.nombreContacto.trim().length < 2) {
      throw new ValidationError('El nombre de contacto es obligatorio.');
    }

    if (!dto.emailContacto || !dto.emailContacto.includes('@')) {
      throw new ValidationError('Debe proporcionar un correo de contacto válido.');
    }

    const cleanArea = SanitizeService.sanitizePlainText(dto.areaProfesional);
    const cleanTitulo = SanitizeService.sanitizePlainText(dto.tituloNecesidad);
    const cleanDescripcion = SanitizeService.sanitizePlainText(dto.descripcion);
    const cleanNombre = SanitizeService.sanitizePlainText(dto.nombreContacto);
    const cleanTelefono = dto.telefonoContacto ? SanitizeService.sanitizePlainText(dto.telefonoContacto) : null;
    const cleanUbicacion = dto.ubicacion ? SanitizeService.sanitizePlainText(dto.ubicacion) : null;

    return VoluntariadoRepository.create({
      tipo: dto.tipo,
      areaProfesional: cleanArea,
      tituloNecesidad: cleanTitulo,
      descripcion: cleanDescripcion,
      nombreContacto: cleanNombre,
      emailContacto: dto.emailContacto.trim().toLowerCase(),
      telefonoContacto: cleanTelefono,
      ubicacion: cleanUbicacion,
      estado: dto.estado || 'pendiente',
    });
  },

  /**
   * Consulta un registro de voluntariado por ID.
   */
  getVolunteering(id: string): Voluntariado {
    const item = VoluntariadoRepository.findById(id);
    if (!item) {
      throw new NotFoundError(`Registro de voluntariado con ID '${id}' no encontrado.`);
    }
    return item;
  },

  /**
   * Lista ofertas y solicitudes de voluntariado con filtros.
   */
  listVolunteering(filters: VoluntariadoFilter = {}): { voluntariados: Voluntariado[]; total: number } {
    return VoluntariadoRepository.findMany(filters);
  },

  /**
   * Matching bidireccional entre ofertas de habilidades y solicitudes de ONGs/brigadas activas.
   */
  matchSkills(areaProfesional: string, ubicacion?: string): {
    ofertas: Voluntariado[];
    demandas: Voluntariado[];
  } {
    const ofertasResult = VoluntariadoRepository.findMany({
      tipo: 'ofrezco_habilidad',
      areaProfesional,
      ubicacion,
      estado: 'activo',
    });

    const demandasResult = VoluntariadoRepository.findMany({
      tipo: 'busco_profesional',
      areaProfesional,
      ubicacion,
      estado: 'activo',
    });

    return {
      ofertas: ofertasResult.voluntariados,
      demandas: demandasResult.voluntariados,
    };
  },

  /**
   * Aprueba una oferta o solicitud de voluntariado pasando de 'pendiente' a 'activo'.
   */
  approveVolunteering(id: string, userRole?: UsuarioRol): Voluntariado {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden aprobar voluntariados.');
    }

    const item = VoluntariadoRepository.findById(id);
    if (!item) {
      throw new NotFoundError(`Registro con ID '${id}' no encontrado.`);
    }

    return VoluntariadoRepository.updateStatus(id, 'activo');
  },

  /**
   * Actualiza el estado de un voluntariado (ej. activo, cubierto, pausado).
   */
  updateStatus(id: string, estado: EstadoVoluntariado, userRole?: UsuarioRol): Voluntariado {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden cambiar el estado del registro.');
    }

    const item = VoluntariadoRepository.findById(id);
    if (!item) {
      throw new NotFoundError(`Registro con ID '${id}' no encontrado.`);
    }

    return VoluntariadoRepository.updateStatus(id, estado);
  },

  /**
   * Elimina un registro de voluntariado (moderadores).
   */
  deleteVolunteering(id: string, userRole?: UsuarioRol): boolean {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden eliminar solicitudes de voluntariado.');
    }

    const existing = VoluntariadoRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Registro con ID '${id}' no encontrado.`);
    }

    return VoluntariadoRepository.delete(id);
  },
};
