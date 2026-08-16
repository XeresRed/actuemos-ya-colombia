import { AlertaRepository } from '../../db/repositories';
import { SanitizeService } from './sanitize.service';
import { 
  NotFoundError, 
  ValidationError, 
  ForbiddenError 
} from '../errors';
import type { 
  AlertaSistema, 
  CreateAlertaDTO, 
  UpdateAlertaDTO, 
  NivelAlerta 
} from '../domain/alerta';
import type { UsuarioRol } from '../domain/usuario';

export const AlertaService = {
  /**
   * Obtiene todas las alertas de crisis actualmente activas para el EmergencyBanner global.
   */
  getActiveAlerts(): AlertaSistema[] {
    return AlertaRepository.getActiveAlerts();
  },

  /**
   * Obtiene la alerta activa más reciente (compatibilidad).
   */
  getActiveAlert(): AlertaSistema | null {
    return AlertaRepository.getActive();
  },

  /**
   * Emite una nueva alerta de emergencia comunitaria (exclusivo para administradores).
   * Permite múltiples alertas activas en el carrusel de emergencia.
   */
  broadcastAlert(dto: CreateAlertaDTO, userRole?: UsuarioRol, userEmail?: string): AlertaSistema {
    if (!userRole || userRole !== 'admin') {
      throw new ForbiddenError('Solo los administradores pueden emitir alertas de emergencia.');
    }

    if (!dto.mensaje || dto.mensaje.trim().length < 10) {
      throw new ValidationError('El mensaje de la alerta debe tener al menos 10 caracteres.');
    }

    const cleanMensaje = SanitizeService.sanitizePlainText(dto.mensaje);
    const cleanActionText = dto.enlaceAccionTexto ? SanitizeService.sanitizePlainText(dto.enlaceAccionTexto) : null;
    const cleanUrl = dto.enlaceAccionUrl ? dto.enlaceAccionUrl.trim() : null;

    if (cleanUrl && !cleanUrl.startsWith('http') && !cleanUrl.startsWith('/')) {
      throw new ValidationError('La URL de acción debe ser una ruta válida (http://, https:// o /...).');
    }

    return AlertaRepository.create({
      nivel: dto.nivel || 'critica',
      mensaje: cleanMensaje,
      activa: dto.activa !== undefined ? dto.activa : true,
      enlaceAccionUrl: cleanUrl,
      enlaceAccionTexto: cleanActionText,
      actualizadoPor: userEmail || 'admin@actuemosyacolombia.org',
    });
  },

  /**
   * Modifica una alerta existente.
   */
  updateAlert(id: string, dto: UpdateAlertaDTO, userRole?: UsuarioRol, userEmail?: string): AlertaSistema {
    if (!userRole || userRole !== 'admin') {
      throw new ForbiddenError('Solo los administradores pueden modificar alertas.');
    }

    const existing = AlertaRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Alerta con ID '${id}' no encontrada.`);
    }

    const cleanDTO: UpdateAlertaDTO = { ...dto };
    if (dto.mensaje) cleanDTO.mensaje = SanitizeService.sanitizePlainText(dto.mensaje);
    if (dto.enlaceAccionTexto) cleanDTO.enlaceAccionTexto = SanitizeService.sanitizePlainText(dto.enlaceAccionTexto);
    if (dto.enlaceAccionUrl) cleanDTO.enlaceAccionUrl = dto.enlaceAccionUrl.trim();
    if (userEmail) cleanDTO.actualizadoPor = userEmail;

    return AlertaRepository.update(id, cleanDTO);
  },

  /**
   * Alterna el estado activo/pausado de una alerta en 1 clic.
   */
  toggleAlertStatus(id: string, activa: boolean, userRole?: UsuarioRol, userEmail?: string): AlertaSistema {
    if (!userRole || userRole !== 'admin') {
      throw new ForbiddenError('Solo los administradores pueden activar o pausar alertas.');
    }

    return this.updateAlert(id, { activa }, userRole, userEmail);
  },

  /**
   * Elimina una alerta del sistema (exclusivo para administradores).
   */
  deleteAlert(id: string, userRole?: UsuarioRol): boolean {
    if (!userRole || userRole !== 'admin') {
      throw new ForbiddenError('Solo los administradores pueden eliminar alertas.');
    }

    const existing = AlertaRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Alerta con ID '${id}' no encontrada.`);
    }

    return AlertaRepository.delete(id);
  },

  /**
   * Desactiva todas las alertas activas (retorno a estado de normalidad).
   */
  deactivateCurrentAlert(userRole?: UsuarioRol): boolean {
    if (!userRole || userRole !== 'admin') {
      throw new ForbiddenError('Solo los administradores pueden desactivar todas las alertas.');
    }

    AlertaRepository.deactivateAll();
    return true;
  },

  /**
   * Consulta el listado completo de alertas (para panel de administración).
   */
  listAlertHistory(limit = 50, userRole?: UsuarioRol): AlertaSistema[] {
    if (!userRole || userRole !== 'admin') {
      throw new ForbiddenError('Acceso restringido a la gestión de alertas.');
    }

    return AlertaRepository.findMany(limit);
  },
};
