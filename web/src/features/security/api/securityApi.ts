import { apiClient } from '@/core/api/client';

export type TipoServicioExterno =
  | 'mantenimiento'
  | 'limpieza'
  | 'mensajeria'
  | 'proveedor'
  | 'contratista'
  | 'otro';

export const TIPO_SERVICIO_LABEL: Record<TipoServicioExterno, string> = {
  mantenimiento: 'Mantenimiento',
  limpieza:      'Limpieza',
  mensajeria:    'Mensajería',
  proveedor:     'Proveedor',
  contratista:   'Contratista',
  otro:          'Otro',
};

export interface ServicioExterno {
  id: string;
  nombre: string;
  empresa: string | null;
  motivo: string;
  tipo_personal: TipoServicioExterno | null;
  fecha_hora_ingreso: string;
  fecha_hora_salida: string | null;
}

export const securityApi = {
  listActivos: (): Promise<ServicioExterno[]> =>
    apiClient.get<ServicioExterno[]>('/external-services', { params: { activos: true } }).then(r => r.data),

  listHistoricoHoy: (): Promise<ServicioExterno[]> =>
    apiClient.get<ServicioExterno[]>('/external-services', { params: { activos: false } }).then(r => r.data),

  registrarIngreso: (payload: {
    nombre: string;
    empresa?: string;
    motivo: string;
    tipo_personal?: TipoServicioExterno;
  }): Promise<ServicioExterno> =>
    apiClient.post<ServicioExterno>('/external-services', payload).then(r => r.data),

  registrarSalida: (id: string): Promise<ServicioExterno> =>
    apiClient.post<ServicioExterno>(`/external-services/${id}/checkout`).then(r => r.data),
};
