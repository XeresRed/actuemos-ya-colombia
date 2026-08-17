import { z } from 'zod';

export const CreateIdeaSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(150, 'El título no puede exceder 150 caracteres'),
  descripcionMarkdown: z.string().min(15, 'La descripción debe tener al menos 15 caracteres').max(10000, 'La descripción no puede exceder 10,000 caracteres'),
  categoria: z.string().min(2, 'La categoría debe ser especificada').max(50),
  alcanceTipo: z.enum(['general', 'region', 'ciudad', 'grupo_especifico']).optional().default('general'),
  alcanceDetalle: z.string().max(150).optional().nullable(),
  iniciativaExistenteUrl: z.string().max(500).optional().nullable(),
  requiereVoluntarios: z.boolean().optional().default(false),
  cantidadVoluntarios: z.number().int().positive('La cantidad de voluntarios debe ser mayor a 0').max(1000).optional().nullable(),
  perfilVoluntarios: z.string().max(200, 'El perfil de voluntarios no puede superar 200 caracteres').optional().nullable(),
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
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(4000),
  categoria: z.string().min(2).max(50),
  urlOficial: z.string().url('Debe ser una URL oficial válida'),
  contacto: z.string().max(150).optional().nullable(),
  coberturaGeografica: z.string().max(150).optional().nullable(),
  direccion: z.string().max(300).optional().nullable(),
  fechaEvento: z.string().max(100).optional().nullable(),
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
  organizacion: z.string().max(150).optional().nullable(),
  emailContacto: z.string().email('Debe ser un correo electrónico válido'),
  telefonoContacto: z.string().max(50).optional().nullable(),
  ubicacion: z.string().max(150).optional().nullable(),
  esMayorDeEdad: z.boolean().refine(val => val === true, {
    message: 'Debe certificar que es mayor de edad (+18) para registrarse.',
  }),
  aceptaTerminos: z.boolean().refine(val => val === true, {
    message: 'Debe aceptar los Términos de Voluntariado y el Descargo de Responsabilidad.',
  }),
  captchaToken: z.string().optional(),
});

export const PatchVoluntariadoSchema = z.object({
  estado: z.enum(['pendiente', 'activo', 'pausado', 'completado']),
});


export const CreateAlertaSchema = z.object({
  nivel: z.enum(['critica', 'alerta_naranja', 'informativa']).default('critica'),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(500),
  activa: z.boolean().optional().default(true),
  enlaceAccionUrl: z.string().optional().nullable(),
  enlaceAccionTexto: z.string().max(100).optional().nullable(),
});

export const PatchAlertaSchema = z.object({
  activa: z.boolean().optional(),
  nivel: z.enum(['critica', 'alerta_naranja', 'informativa']).optional(),
  mensaje: z.string().min(10).max(500).optional(),
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

export const RegisterSupervisorSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  email: z.string().email('Debe ser un correo electrónico válido'),
  organizacion: z.string().max(150).optional().nullable(),
  motivacion: z.string().min(10, 'Por favor comparte una breve justificación o experiencia (mínimo 10 caracteres)').max(1000),
  captchaToken: z.string().optional(),
});

export const UpdateUsuarioSchema = z.object({
  activo: z.boolean().optional(),
  rol: z.enum(['admin', 'supervisor']).optional(),
  nombre: z.string().max(100).optional().nullable(),
});

export const MasterLoginSchema = z.object({
  email: z.string().email('Debe proporcionar un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const CreateSolicitudLegalSchema = z.object({
  nombreCiudadano: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(150),
  tipoDocumento: z.enum(['CC', 'TI', 'CE', 'PTP', 'Pasaporte']).optional().default('CC'),
  cedulaCiudadano: z.string().min(4, 'El documento debe tener al menos 4 caracteres').max(30),
  emailContacto: z.string().email('Debe ser un correo electrónico válido'),
  telefonoContacto: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos').max(20),
  departamento: z.string().min(2, 'El departamento es requerido').max(100),
  municipio: z.string().min(2, 'El municipio o ciudad es requerido').max(100),
  direccionFisica: z.string().max(200).optional().nullable(),
  asunto: z.string().min(5, 'El asunto debe tener al menos 5 caracteres').max(200),
  hechos: z.string().min(15, 'Los hechos deben tener al menos 15 caracteres').max(5000),
  peticiones: z.string().min(10, 'Las peticiones deben tener al menos 10 caracteres').max(5000),
  anexos: z.string().max(1000).optional().nullable(),
  aceptaConsentimiento: z.boolean().refine((val) => val === true, {
    message: 'Debe aceptar el consentimiento de tratamiento de datos y el descargo legal',
  }),
  captchaToken: z.string().optional(),
});

export const PatchSolicitudLegalSchema = z.object({
  estado: z.enum(['pendiente', 'en_contacto', 'atendida', 'cerrada']).optional(),
  abogadoAsignado: z.string().max(150).optional().nullable(),
  notasSeguimiento: z.string().max(2000).optional().nullable(),
});

export const TrackBeaconSchema = z.object({
  type: z.enum(['pageview', 'event']).optional().default('pageview'),
  path: z.string().min(1).max(500),
  sessionId: z.string().max(100).optional().nullable(),
  metodo: z.string().max(10).optional().default('GET'),
  codigoEstado: z.number().int().min(100).max(599).optional().default(200),
  tiempoRespuestaMs: z.number().int().min(0).max(60000).optional().default(0),
  referrer: z.string().max(1000).optional().nullable(),
  esPagina: z.boolean().optional().default(true),
  
  // Custom event fields
  nombreEvento: z.string().max(100).optional(),
  categoria: z.enum(['conversion', 'interaccion', 'emergencia', 'navegacion']).optional().default('interaccion'),
  etiqueta: z.string().max(200).optional().nullable(),
  valorNumerico: z.number().optional().nullable(),
  metadatos: z.record(z.any()).optional().nullable(),
});

export const AnalyticsQuerySchema = z.object({
  timeframe: z.enum(['24h', '7d', '30d', 'all']).optional().default('24h'),
});



