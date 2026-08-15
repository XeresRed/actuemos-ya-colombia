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
   * Obtiene la alerta de crisis actualmente activa para el EmergencyBanner global.
   */
  getActiveAlert(): AlertaSistema | null {
    return AlertaRepository.getActive();
  },

  /**
   * Emite una nueva alerta de emergencia comunitaria (exclusivo para moderadores/admins).
   * Desactiva automáticamente cualquier alerta previa para mantener un solo foco de atención.
   */
  broadcastAlert(dto: CreateAlertaDTO, userRole?: UsuarioRol, userEmail?: string): AlertaSistema {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo administradores y supervisores pueden emitir alertas de emergencia.');
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
      actualizadoPor: userEmail || 'moderacion@actuemosya.org',
    });
  },

  /**
   * Modifica una alerta existente.
   */
  updateAlert(id: string, dto: UpdateAlertaDTO, userRole?: UsuarioRol, userEmail?: string): AlertaSistema {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden actualizar alertas.');
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
   * Desactiva todas las alertas activas (retorno a estado de normalidad).
   */
  deactivateCurrentAlert(userRole?: UsuarioRol): boolean {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden desactivar alertas.');
    }

    AlertaRepository.deactivateAll();
    return true;
  },

  /**
   * Consulta el historial de alertas emitidas.
   */
  listAlertHistory(limit = 10, userRole?: UsuarioRol): AlertaSistema[] {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Acceso restringido al historial de alertas.');
    }

    return AlertaRepository.findMany(limit);
  },
};
