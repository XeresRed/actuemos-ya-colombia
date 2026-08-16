import { SolicitudLegalRepository } from '../../db/repositories/solicitud-legal.repository';
import { SanitizeService } from './sanitize.service';
import { CaptchaService } from './captcha.service';
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from '../errors';
import type {
  SolicitudAsistenciaLegal,
  CreateSolicitudLegalDTO,
  UpdateSolicitudLegalDTO,
  SolicitudLegalFilter,
  SolicitudLegalEstado,
} from '../domain/solicitud-legal';
import type { UsuarioRol } from '../domain/usuario';

export const LegalService = {
  /**
   * Registra una nueva solicitud ciudadana de asistencia legal ante emergencias.
   */
  async createSolicitud(
    dto: CreateSolicitudLegalDTO,
    captchaToken?: string
  ): Promise<SolicitudAsistenciaLegal> {
    const isCaptchaValid = await CaptchaService.verifyToken(captchaToken);
    if (!isCaptchaValid) {
      throw new ValidationError('Validación de seguridad anti-bot fallida. Por favor, intente nuevamente.');
    }

    if (!dto.nombreCiudadano || dto.nombreCiudadano.trim().length < 3) {
      throw new ValidationError('El nombre del ciudadano debe tener al menos 3 caracteres.');
    }

    if (!dto.cedulaCiudadano || dto.cedulaCiudadano.trim().length < 4) {
      throw new ValidationError('El número de identificación debe tener al menos 4 caracteres.');
    }

    if (!dto.emailContacto || !dto.emailContacto.includes('@')) {
      throw new ValidationError('Debe proporcionar un correo electrónico válido de contacto.');
    }

    if (!dto.telefonoContacto || dto.telefonoContacto.trim().length < 7) {
      throw new ValidationError('El número telefónico de contacto debe tener al menos 7 dígitos.');
    }

    if (!dto.asunto || dto.asunto.trim().length < 5) {
      throw new ValidationError('El asunto de la petición debe tener al menos 5 caracteres.');
    }

    if (!dto.hechos || dto.hechos.trim().length < 15) {
      throw new ValidationError('La descripción de los hechos debe tener al menos 15 caracteres.');
    }

    if (!dto.peticiones || dto.peticiones.trim().length < 10) {
      throw new ValidationError('Las peticiones concretas deben tener al menos 10 caracteres.');
    }

    const cleanNombre = SanitizeService.sanitizePlainText(dto.nombreCiudadano);
    const cleanCedula = SanitizeService.sanitizePlainText(dto.cedulaCiudadano);
    const cleanEmail = dto.emailContacto.trim().toLowerCase();
    const cleanTelefono = SanitizeService.sanitizePlainText(dto.telefonoContacto);
    const cleanDepartamento = SanitizeService.sanitizePlainText(dto.departamento);
    const cleanMunicipio = SanitizeService.sanitizePlainText(dto.municipio);
    const cleanDireccion = dto.direccionFisica ? SanitizeService.sanitizePlainText(dto.direccionFisica) : null;
    const cleanAsunto = SanitizeService.sanitizePlainText(dto.asunto);
    const cleanHechos = SanitizeService.sanitizeMarkdown(dto.hechos);
    const cleanPeticiones = SanitizeService.sanitizeMarkdown(dto.peticiones);
    const cleanAnexos = dto.anexos ? SanitizeService.sanitizePlainText(dto.anexos) : null;

    return SolicitudLegalRepository.create({
      nombreCiudadano: cleanNombre,
      tipoDocumento: dto.tipoDocumento || 'CC',
      cedulaCiudadano: cleanCedula,
      emailContacto: cleanEmail,
      telefonoContacto: cleanTelefono,
      departamento: cleanDepartamento,
      municipio: cleanMunicipio,
      direccionFisica: cleanDireccion,
      asunto: cleanAsunto,
      hechos: cleanHechos,
      peticiones: cleanPeticiones,
      anexos: cleanAnexos,
      estado: 'pendiente',
    });
  },

  /**
   * Consulta una solicitud por ID (exclusivo para moderadores y administradores).
   */
  async getSolicitudById(id: string, userRole?: UsuarioRol): Promise<SolicitudAsistenciaLegal> {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Acceso restringido a moderadores y administradores.');
    }

    const solicitud = SolicitudLegalRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundError(`Solicitud legal con ID '${id}' no encontrada.`);
    }

    return solicitud;
  },

  /**
   * Lista solicitudes con paginación y filtros (exclusivo para moderadores).
   */
  async listSolicitudes(
    filters: SolicitudLegalFilter = {},
    userRole?: UsuarioRol
  ): Promise<{ solicitudes: SolicitudAsistenciaLegal[]; total: number }> {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Acceso restringido a moderadores y administradores.');
    }

    return SolicitudLegalRepository.findMany(filters);
  },

  /**
   * Actualiza el estado o notas de seguimiento de una solicitud legal.
   */
  async updateSolicitud(
    id: string,
    dto: UpdateSolicitudLegalDTO,
    userRole?: UsuarioRol
  ): Promise<SolicitudAsistenciaLegal> {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Acceso restringido a moderadores y administradores.');
    }

    const existing = SolicitudLegalRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Solicitud legal con ID '${id}' no encontrada.`);
    }

    const cleanAbogado = dto.abogadoAsignado ? SanitizeService.sanitizePlainText(dto.abogadoAsignado) : undefined;
    const cleanNotas = dto.notasSeguimiento ? SanitizeService.sanitizePlainText(dto.notasSeguimiento) : undefined;

    return SolicitudLegalRepository.update(id, {
      estado: dto.estado,
      abogadoAsignado: cleanAbogado,
      notasSeguimiento: cleanNotas,
    });
  },

  /**
   * Elimina una solicitud legal (exclusivo para administradores).
   */
  async deleteSolicitud(id: string, userRole?: UsuarioRol): Promise<boolean> {
    if (!userRole || userRole !== 'admin') {
      throw new ForbiddenError('Solo los administradores pueden eliminar solicitudes legales.');
    }

    const existing = SolicitudLegalRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Solicitud legal con ID '${id}' no encontrada.`);
    }

    return SolicitudLegalRepository.delete(id);
  },

  /**
   * Retorna conteo de solicitudes por estado.
   */
  async getCounts(userRole?: UsuarioRol): Promise<Record<SolicitudLegalEstado, number>> {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Acceso restringido a moderadores y administradores.');
    }

    return SolicitudLegalRepository.countByEstado();
  },
};
