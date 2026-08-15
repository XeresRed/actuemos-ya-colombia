export type TipoReporte = 'persona' | 'animal';

export type EstadoBusqueda = 
  | 'buscado'
  | 'en_refugio'
  | 'localizado'
  | 'perdido'
  | 'rescatado'
  | 'en_hogar_temporal';

export interface ReporteBusqueda {
  id: string;
  tipo: TipoReporte;
  nombre: string | null;
  especie: string | null;
  descripcionRasgos: string;
  ubicacion: string;
  fotoUrl: string | null;
  estado: EstadoBusqueda;
  contactoEmergencia: string;
  verificadoPorSupervisor: boolean;
  creadoEn: string;
}

export interface CreateReporteDTO {
  id?: string;
  tipo: TipoReporte;
  nombre?: string | null;
  especie?: string | null;
  descripcionRasgos: string;
  ubicacion: string;
  fotoUrl?: string | null;
  estado?: EstadoBusqueda;
  contactoEmergencia: string;
  verificadoPorSupervisor?: boolean;
}

export interface UpdateReporteDTO {
  nombre?: string | null;
  especie?: string | null;
  descripcionRasgos?: string;
  ubicacion?: string;
  fotoUrl?: string | null;
  estado?: EstadoBusqueda;
  contactoEmergencia?: string;
  verificadoPorSupervisor?: boolean;
}

export interface BusquedaFilter {
  tipo?: TipoReporte;
  estado?: EstadoBusqueda | EstadoBusqueda[];
  ubicacion?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
