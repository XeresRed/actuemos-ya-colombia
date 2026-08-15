import { BusquedaRepository } from '../../db/repositories';
import { SanitizeService } from './sanitize.service';
import { CaptchaService } from './captcha.service';
import { 
  NotFoundError, 
  ValidationError, 
  ForbiddenError 
} from '../errors';
import type { 
  ReporteBusqueda, 
  CreateReporteDTO, 
  UpdateReporteDTO, 
  BusquedaFilter, 
  EstadoBusqueda 
} from '../domain/busqueda';
import type { UsuarioRol } from '../domain/usuario';

export const BusquedaService = {
  /**
   * Registra un nuevo reporte humanitario de persona o animal extraviado/albergado.
   */
  async createReport(dto: CreateReporteDTO, captchaToken?: string): Promise<ReporteBusqueda> {
    const isCaptchaValid = await CaptchaService.verifyToken(captchaToken);
    if (!isCaptchaValid) {
      throw new ValidationError('Validación de seguridad anti-bot fallida.');
    }

    if (!dto.descripcionRasgos || dto.descripcionRasgos.trim().length < 10) {
      throw new ValidationError('La descripción de rasgos físicos y señas particulares debe tener al menos 10 caracteres.');
    }

    if (!dto.ubicacion || dto.ubicacion.trim().length < 3) {
      throw new ValidationError('La ubicación o último lugar visto debe tener al menos 3 caracteres.');
    }

    if (!dto.contactoEmergencia || dto.contactoEmergencia.trim().length < 7) {
      throw new ValidationError('Debe proporcionar un número o canal de contacto de emergencia válido.');
    }

    const cleanNombre = dto.nombre ? SanitizeService.sanitizePlainText(dto.nombre) : null;
    const cleanEspecie = dto.especie ? SanitizeService.sanitizePlainText(dto.especie) : null;
    const cleanRasgos = SanitizeService.sanitizePlainText(dto.descripcionRasgos);
    const cleanUbicacion = SanitizeService.sanitizePlainText(dto.ubicacion);
    const cleanContacto = SanitizeService.sanitizePlainText(dto.contactoEmergencia);
    const cleanFoto = dto.fotoUrl ? SanitizeService.sanitizePlainText(dto.fotoUrl) : null;

    return BusquedaRepository.create({
      tipo: dto.tipo,
      nombre: cleanNombre,
      especie: cleanEspecie,
      descripcionRasgos: cleanRasgos,
      ubicacion: cleanUbicacion,
      fotoUrl: cleanFoto,
      estado: dto.estado || 'buscado',
      contactoEmergencia: cleanContacto,
      verificadoPorSupervisor: false,
    });
  },

  /**
   * Actualiza el estado humanitario de un reporte (ej. encontrado, en refugio).
   */
  async updateStatus(id: string, newStatus: EstadoBusqueda, userRole?: UsuarioRol): Promise<ReporteBusqueda> {
    const report = BusquedaRepository.findById(id);
    if (!report) {
      throw new NotFoundError(`Reporte con ID '${id}' no encontrado.`);
    }

    return BusquedaRepository.updateStatus(id, newStatus);
  },

  /**
   * Marca un reporte como verificado por un supervisor.
   */
  async verifyReport(id: string, userRole?: UsuarioRol): Promise<ReporteBusqueda> {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden verificar reportes.');
    }

    const report = BusquedaRepository.findById(id);
    if (!report) {
      throw new NotFoundError(`Reporte con ID '${id}' no encontrado.`);
    }

    return BusquedaRepository.update(id, { verificadoPorSupervisor: true });
  },

  /**
   * Consulta un reporte por ID.
   */
  getReport(id: string): ReporteBusqueda {
    const report = BusquedaRepository.findById(id);
    if (!report) {
      throw new NotFoundError(`Reporte con ID '${id}' no encontrado.`);
    }
    return report;
  },

  /**
   * Lista reportes de personas y animales con filtros.
   */
  listReports(filters: BusquedaFilter = {}): { reportes: ReporteBusqueda[]; total: number } {
    return BusquedaRepository.findMany(filters);
  },

  /**
   * Elimina un reporte humanitario (solo moderadores).
   */
  deleteReport(id: string, userRole?: UsuarioRol): boolean {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden eliminar reportes.');
    }

    return BusquedaRepository.delete(id);
  },
};
