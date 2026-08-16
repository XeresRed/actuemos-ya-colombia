export type TipoVoluntariado = 'ofrezco_habilidad' | 'busco_profesional';
export type EstadoVoluntariado = 'pendiente' | 'activo' | 'cubierto' | 'pausado' | 'completado';


export interface Voluntariado {
  id: string;
  tipo: TipoVoluntariado;
  areaProfesional: string;
  tituloNecesidad: string;
  descripcion: string;
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto: string | null;
  ubicacion: string | null;
  estado: EstadoVoluntariado;
  creadoEn: string;
}

export interface CreateVoluntariadoDTO {
  id?: string;
  tipo: TipoVoluntariado;
  areaProfesional: string;
  tituloNecesidad: string;
  descripcion: string;
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto?: string | null;
  ubicacion?: string | null;
  estado?: EstadoVoluntariado;
}

export interface UpdateVoluntariadoDTO {
  areaProfesional?: string;
  tituloNecesidad?: string;
  descripcion?: string;
  nombreContacto?: string;
  emailContacto?: string;
  telefonoContacto?: string | null;
  ubicacion?: string | null;
  estado?: EstadoVoluntariado;
}

export interface VoluntariadoFilter {
  tipo?: TipoVoluntariado;
  areaProfesional?: string;
  estado?: EstadoVoluntariado;
  ubicacion?: string;
  search?: string;
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
}
