export type NivelAlerta = 'critica' | 'alerta_naranja' | 'informativa';

export interface AlertaSistema {
  id: string;
  nivel: NivelAlerta;
  mensaje: string;
  activa: boolean;
  enlaceAccionUrl: string | null;
  enlaceAccionTexto: string | null;
  actualizadoPor: string | null;
  actualizadoEn: string;
}

export interface CreateAlertaDTO {
  id?: string;
  nivel?: NivelAlerta;
  mensaje: string;
  activa?: boolean;
  enlaceAccionUrl?: string | null;
  enlaceAccionTexto?: string | null;
  actualizadoPor?: string | null;
}

export interface UpdateAlertaDTO {
  nivel?: NivelAlerta;
  mensaje?: string;
  activa?: boolean;
  enlaceAccionUrl?: string | null;
  enlaceAccionTexto?: string | null;
  actualizadoPor?: string | null;
}
