export type IniciativaEstado = 'activa' | 'pausada' | 'completada';

export interface Iniciativa {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  urlOficial: string;
  contacto: string | null;
  coberturaGeografica: string | null;
  direccion: string | null;
  fechaEvento: string | null;
  estadoOperacion: IniciativaEstado;
  creadoEn: string;
}

export interface CreateIniciativaDTO {
  id?: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  urlOficial: string;
  contacto?: string | null;
  coberturaGeografica?: string | null;
  direccion?: string | null;
  fechaEvento?: string | null;
  estadoOperacion?: IniciativaEstado;
}

export interface UpdateIniciativaDTO {
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  urlOficial?: string;
  contacto?: string | null;
  coberturaGeografica?: string | null;
  direccion?: string | null;
  fechaEvento?: string | null;
  estadoOperacion?: IniciativaEstado;
}

export interface IniciativaFilter {
  categoria?: string;
  estadoOperacion?: IniciativaEstado;
  coberturaGeografica?: string;
  search?: string;
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
}
