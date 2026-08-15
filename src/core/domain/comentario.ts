export type ComentarioEstado = 'visible' | 'oculto' | 'pendiente_moderacion';

export interface Comentario {
  id: string;
  ideaId: string;
  comentarioPadreId: string | null;
  contenidoMarkdown: string;
  esAnonimo: boolean;
  autorEmail: string | null;
  verificado: boolean;
  estado: ComentarioEstado;
  creadoEn: string;
}

export interface ComentarioConRespuestas extends Comentario {
  respuestas: ComentarioConRespuestas[];
}

export interface CreateComentarioDTO {
  id?: string;
  ideaId: string;
  comentarioPadreId?: string | null;
  contenidoMarkdown: string;
  esAnonimo?: boolean;
  autorEmail?: string | null;
  verificado?: boolean;
  estado?: ComentarioEstado;
}

export interface UpdateComentarioEstadoDTO {
  estado: ComentarioEstado;
}
