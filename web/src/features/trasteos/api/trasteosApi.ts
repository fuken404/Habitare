import { apiClient } from '@/core/api/client';

export type TipoTrasteo   = 'entrada' | 'salida';
export type EstadoTrasteo = 'solicitado' | 'autorizado' | 'rechazado' | 'completado';

export interface TrasteoItem {
  id: string;
  tenant_id: string;
  unidad_id: string;
  creado_por: string;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin: string;
  tipo: TipoTrasteo;
  estado: EstadoTrasteo;
  observaciones: string | null;
  created_at: string;
  numero_unidad: string | null;
  nombre_torre: string | null;
  nombre_creador: string | null;
}

export interface TrasteoCreate {
  unidad_id: string;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin: string;
  tipo: TipoTrasteo;
  observaciones?: string;
}

export interface TrasteoUpdate {
  estado?: EstadoTrasteo;
  observaciones?: string;
}

export const trasteosApi = {
  list: (params?: { fecha?: string; estado?: EstadoTrasteo }): Promise<TrasteoItem[]> =>
    apiClient.get<TrasteoItem[]>('/trasteos', { params }).then(r => r.data),

  crear: (payload: TrasteoCreate): Promise<TrasteoItem> =>
    apiClient.post<TrasteoItem>('/trasteos', payload).then(r => r.data),

  actualizar: (id: string, payload: TrasteoUpdate): Promise<TrasteoItem> =>
    apiClient.patch<TrasteoItem>(`/trasteos/${id}`, payload).then(r => r.data),
};
