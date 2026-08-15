export type UsuarioRol = 'admin' | 'supervisor';

export interface Usuario {
  id: string;
  email: string;
  nombre: string | null;
  rol: UsuarioRol;
  activo: boolean;
  creadoEn: string;
}

export interface CreateUsuarioDTO {
  id?: string;
  email: string;
  nombre?: string | null;
  rol: UsuarioRol;
  activo?: boolean;
}

export interface UpdateUsuarioDTO {
  nombre?: string | null;
  rol?: UsuarioRol;
  activo?: boolean;
}
