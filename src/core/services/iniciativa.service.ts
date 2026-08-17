import { IniciativaRepository } from '../../db/repositories';
import { SanitizeService } from './sanitize.service';
import { 
  NotFoundError, 
  ValidationError, 
  ForbiddenError 
} from '../errors';
import type { 
  Iniciativa, 
  CreateIniciativaDTO, 
  UpdateIniciativaDTO, 
  IniciativaFilter 
} from '../domain/iniciativa';
import type { UsuarioRol } from '../domain/usuario';

export const IniciativaService = {
  /**
   * Registra una nueva iniciativa o campaña activa con soporte Markdown.
   */
  createInitiative(dto: CreateIniciativaDTO, userRole?: UsuarioRol): Iniciativa {
    // Si se intenta registrar como organismo oficial, requiere rol de moderador
    if (dto.categoria === 'organismo_oficial' && (!userRole || (userRole !== 'admin' && userRole !== 'supervisor'))) {
      throw new ForbiddenError('Solo moderadores autorizados pueden registrar organismos oficiales del Estado.');
    }

    if (!dto.nombre || dto.nombre.trim().length < 3) {
      throw new ValidationError('El nombre de la iniciativa debe tener al menos 3 caracteres.');
    }

    if (!dto.descripcion || dto.descripcion.trim().length < 10) {
      throw new ValidationError('La descripción de la iniciativa debe tener al menos 10 caracteres.');
    }

    if (!dto.urlOficial || !dto.urlOficial.startsWith('http')) {
      throw new ValidationError('Debe proporcionar una URL oficial válida (http:// o https://).');
    }

    const cleanNombre = SanitizeService.sanitizePlainText(dto.nombre);
    const cleanDescripcion = SanitizeService.sanitizeMarkdown(dto.descripcion);
    const cleanContacto = dto.contacto ? SanitizeService.sanitizePlainText(dto.contacto) : null;
    const cleanCobertura = dto.coberturaGeografica ? SanitizeService.sanitizePlainText(dto.coberturaGeografica) : null;
    const cleanDireccion = dto.direccion ? SanitizeService.sanitizePlainText(dto.direccion) : null;
    const cleanFechaEvento = dto.fechaEvento ? SanitizeService.sanitizePlainText(dto.fechaEvento) : null;

    return IniciativaRepository.create({
      nombre: cleanNombre,
      descripcion: cleanDescripcion,
      categoria: dto.categoria || 'General',
      urlOficial: dto.urlOficial.trim(),
      contacto: cleanContacto,
      coberturaGeografica: cleanCobertura,
      direccion: cleanDireccion,
      fechaEvento: cleanFechaEvento,
      estadoOperacion: dto.estadoOperacion || 'activa',
    });
  },

  /**
   * Consulta una iniciativa por ID.
   */
  getInitiative(id: string): Iniciativa {
    const iniciativa = IniciativaRepository.findById(id);
    if (!iniciativa) {
      throw new NotFoundError(`Iniciativa con ID '${id}' no encontrada.`);
    }
    return iniciativa;
  },

  /**
   * Lista iniciativas activas con filtros.
   */
  listInitiatives(filters: IniciativaFilter = {}): { iniciativas: Iniciativa[]; total: number } {
    return IniciativaRepository.findMany(filters);
  },

  /**
   * Obtiene la lista prioritaria de organismos y canales oficiales verificados.
   */
  getOfficialEntities(): Iniciativa[] {
    return IniciativaRepository.findOfficial();
  },

  /**
   * Actualiza una iniciativa existente (exclusivo para moderadores).
   */
  updateInitiative(id: string, dto: UpdateIniciativaDTO, userRole?: UsuarioRol): Iniciativa {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden modificar iniciativas.');
    }

    const existing = IniciativaRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Iniciativa con ID '${id}' no encontrada.`);
    }

    const cleanDTO: UpdateIniciativaDTO = { ...dto };
    if (dto.nombre) cleanDTO.nombre = SanitizeService.sanitizePlainText(dto.nombre);
    if (dto.descripcion) cleanDTO.descripcion = SanitizeService.sanitizeMarkdown(dto.descripcion);
    if (dto.contacto !== undefined) cleanDTO.contacto = dto.contacto ? SanitizeService.sanitizePlainText(dto.contacto) : null;
    if (dto.coberturaGeografica !== undefined) cleanDTO.coberturaGeografica = dto.coberturaGeografica ? SanitizeService.sanitizePlainText(dto.coberturaGeografica) : null;
    if (dto.direccion !== undefined) cleanDTO.direccion = dto.direccion ? SanitizeService.sanitizePlainText(dto.direccion) : null;
    if (dto.fechaEvento !== undefined) cleanDTO.fechaEvento = dto.fechaEvento ? SanitizeService.sanitizePlainText(dto.fechaEvento) : null;

    return IniciativaRepository.update(id, cleanDTO);
  },

  /**
   * Elimina una iniciativa activa (administradores y supervisores).
   */
  deleteInitiative(id: string, userRole?: UsuarioRol): boolean {
    if (!userRole || (userRole !== 'admin' && userRole !== 'supervisor')) {
      throw new ForbiddenError('Solo moderadores autorizados pueden eliminar iniciativas.');
    }

    const existing = IniciativaRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Iniciativa con ID '${id}' no encontrada.`);
    }

    return IniciativaRepository.delete(id);
  },
};
