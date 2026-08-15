import { z } from 'zod';

export const CreateIdeaSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(150, 'El título no puede exceder 150 caracteres'),
  descripcionMarkdown: z.string().min(15, 'La descripción debe tener al menos 15 caracteres').max(10000, 'La descripción no puede exceder 10,000 caracteres'),
  categoria: z.string().min(2, 'La categoría debe ser especificada').max(50),
  alcanceTipo: z.enum(['general', 'region', 'ciudad', 'grupo_especifico']).optional().default('general'),
  alcanceDetalle: z.string().max(150).optional().nullable(),
  esAnonimo: z.boolean().optional().default(false),
  emailCreador: z.string().email('Debe ser un correo electrónico válido').optional().nullable(),
  captchaToken: z.string().optional(),
});

export const VerifyIdeaOtpSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  otpCode: z.string().length(6, 'El código OTP debe ser exactamente de 6 dígitos'),
});

export const PatchIdeaSchema = z.object({
  action: z.enum(['aprobar_borrador', 'promover', 'activar', 'redirigir', 'cerrar']),
  iniciativaUrl: z.string().url('Debe ser una URL válida').optional(),
});

export const CreateComentarioSchema = z.object({
  ideaId: z.string().min(1, 'El ID de la propuesta es requerido'),
  comentarioPadreId: z.string().optional().nullable(),
  contenidoMarkdown: z.string().min(3, 'El comentario debe tener al menos 3 caracteres').max(2000, 'El comentario no puede exceder 2,000 caracteres'),
  esAnonimo: z.boolean().optional().default(true),
  autorEmail: z.string().email('Debe ser un correo electrónico válido').optional().nullable(),
  captchaToken: z.string().optional(),
});

export const CreateIniciativaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(150),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(2000),
  categoria: z.string().min(2).max(50),
  urlOficial: z.string().url('Debe ser una URL oficial válida'),
  contacto: z.string().max(150).optional().nullable(),
  coberturaGeografica: z.string().max(150).optional().nullable(),
  estadoOperacion: z.enum(['activa', 'pausada', 'completada']).optional().default('activa'),
});

export const CreateReporteBusquedaSchema = z.object({
  tipo: z.enum(['persona', 'animal']),
  nombre: z.string().max(150).optional().nullable(),
  especie: z.string().max(50).optional().nullable(),
  descripcionRasgos: z.string().min(10, 'La descripción de rasgos debe tener al menos 10 caracteres').max(2000),
  ubicacion: z.string().min(3, 'La ubicación debe tener al menos 3 caracteres').max(150),
  fotoUrl: z.string().url('Debe ser una URL de imagen válida').optional().nullable(),
  contactoEmergencia: z.string().min(7, 'El contacto de emergencia debe ser válido').max(100),
  estado: z.enum(['buscado', 'en_refugio', 'localizado', 'perdido', 'rescatado', 'en_hogar_temporal']).optional().default('buscado'),
  captchaToken: z.string().optional(),
});

export const PatchBusquedaSchema = z.object({
  estado: z.enum(['buscado', 'en_refugio', 'localizado', 'perdido', 'rescatado', 'en_hogar_temporal']).optional(),
  verificar: z.boolean().optional(),
});

export const CreateVoluntariadoSchema = z.object({
  tipo: z.enum(['ofrezco_habilidad', 'busco_profesional']),
  areaProfesional: z.string().min(3, 'Debe especificar el área profesional').max(100),
  tituloNecesidad: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(150),
  descripcion: z.string().min(15, 'La descripción debe tener al menos 15 caracteres').max(3000),
  nombreContacto: z.string().min(2, 'Nombre de contacto obligatorio').max(100),
  emailContacto: z.string().email('Debe ser un correo electrónico válido'),
  telefonoContacto: z.string().max(50).optional().nullable(),
  ubicacion: z.string().max(150).optional().nullable(),
  captchaToken: z.string().optional(),
});

export const CreateAlertaSchema = z.object({
  nivel: z.enum(['critica', 'alerta_naranja', 'informativa']).default('critica'),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(500),
  activa: z.boolean().optional().default(true),
  enlaceAccionUrl: z.string().optional().nullable(),
  enlaceAccionTexto: z.string().max(100).optional().nullable(),
});

export const RequestMagicLinkSchema = z.object({
  email: z.string().email('Debe proporcionar un correo electrónico válido'),
});

export const VerifyMagicLinkSchema = z.object({
  email: z.string().email('Debe proporcionar un correo electrónico válido'),
  token: z.string().min(10, 'Token de verificación no válido'),
});
