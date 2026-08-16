export type SolicitudLegalEstado = 
  | 'pendiente'
  | 'en_contacto'
  | 'atendida'
  | 'cerrada';

export interface SolicitudAsistenciaLegal {
  id: string;
  nombreCiudadano: string;
  tipoDocumento: string;
  cedulaCiudadano: string;
  emailContacto: string;
  telefonoContacto: string;
  departamento: string;
  municipio: string;
  direccionFisica: string | null;
  asunto: string;
  hechos: string;
  peticiones: string;
  anexos: string | null;
  estado: SolicitudLegalEstado;
  abogadoAsignado: string | null;
  notasSeguimiento: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreateSolicitudLegalDTO {
  id?: string;
  nombreCiudadano: string;
  tipoDocumento?: string;
  cedulaCiudadano: string;
  emailContacto: string;
  telefonoContacto: string;
  departamento: string;
  municipio: string;
  direccionFisica?: string | null;
  asunto: string;
  hechos: string;
  peticiones: string;
  anexos?: string | null;
  aceptaConsentimiento?: boolean;
  estado?: SolicitudLegalEstado;
  abogadoAsignado?: string | null;
  notasSeguimiento?: string | null;
}

export interface UpdateSolicitudLegalDTO {
  estado?: SolicitudLegalEstado;
  abogadoAsignado?: string | null;
  notasSeguimiento?: string | null;
}

export interface SolicitudLegalFilter {
  estado?: SolicitudLegalEstado | SolicitudLegalEstado[];
  departamento?: string;
  municipio?: string;
  search?: string;
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
}
