export type AuthTokenType = 
  | 'login_admin'
  | 'verificacion_idea'
  | 'verificacion_comentario';

export interface AuthToken {
  id: string;
  email: string;
  codigoHash: string;
  tipo: AuthTokenType;
  referenciaId: string | null;
  expiraEn: string;
  usado: boolean;
  creadoEn: string;
}

export interface CreateAuthTokenDTO {
  id?: string;
  email: string;
  codigoHash: string;
  tipo: AuthTokenType;
  referenciaId?: string | null;
  expiraEn: string;
  usado?: boolean;
}
