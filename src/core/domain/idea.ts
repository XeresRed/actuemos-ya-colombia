export type IdeaEstado = 
  | 'borrador'
  | 'idea'
  | 'promovida'
  | 'en_accion'
  | 'cerrada'
  | 'redirigida';

export type AlcanceTipo = 
  | 'general'
  | 'region'
  | 'ciudad'
  | 'grupo_especifico';

export interface Idea {
  id: string;
  titulo: string;
  descripcionMarkdown: string;
  categoria: string;
  alcanceTipo: AlcanceTipo;
  alcanceDetalle: string | null;
  estado: IdeaEstado;
  iniciativaExistenteUrl: string | null;
  requiereVoluntarios: boolean;
  cantidadVoluntarios: number | null;
  perfilVoluntarios: string | null;
  esAnonimo: boolean;
  emailCreador: string | null;
  verificado: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreateIdeaDTO {
  id?: string;
  titulo: string;
  descripcionMarkdown: string;
  categoria: string;
  alcanceTipo?: AlcanceTipo;
  alcanceDetalle?: string | null;
  estado?: IdeaEstado;
  iniciativaExistenteUrl?: string | null;
  requiereVoluntarios?: boolean;
  cantidadVoluntarios?: number | null;
  perfilVoluntarios?: string | null;
  esAnonimo?: boolean;
  emailCreador?: string | null;
  verificado?: boolean;
}

export interface UpdateIdeaDTO {
  titulo?: string;
  descripcionMarkdown?: string;
  categoria?: string;
  alcanceTipo?: AlcanceTipo;
  alcanceDetalle?: string | null;
  estado?: IdeaEstado;
  iniciativaExistenteUrl?: string | null;
  requiereVoluntarios?: boolean;
  cantidadVoluntarios?: number | null;
  perfilVoluntarios?: string | null;
  verificado?: boolean;
}

export interface IdeaFilter {
  estado?: IdeaEstado | IdeaEstado[];
  categoria?: string;
  alcanceTipo?: AlcanceTipo;
  requiereVoluntarios?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
}
