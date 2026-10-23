import { apiClient } from '@/core/api/client';

export type EstadoCita = 'solicitada' | 'confirmada' | 'rechazada' | 'completada';

export interface DisponibilidadItem {
  id: string;
  tenant_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  cupos_totales: number;
  cupos_disponibles: number;
  created_at: string;
}

export interface CitaItem {
  id: string;
  tenant_id: string;
  disponibilidad_id: string;
  residente_id: string;
  motivo: string;
  estado: EstadoCita;
  observaciones_admin: string | null;
  created_at: string;
  fecha: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  nombre_residente: string | null;
  numero_unidad: string | null;
  nombre_torre: string | null;
}

export interface DisponibilidadCreate {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  cupos_totales?: number;
}

export interface CitaUpdate {
  estado?: EstadoCita;
  observaciones_admin?: string;
}

export const appointmentsApi = {
  listDisponibilidad: (params?: { fecha?: string; solo_futuras?: boolean }): Promise<DisponibilidadItem[]> =>
    apiClient.get<DisponibilidadItem[]>('/citas/disponibilidad', { params }).then(r => r.data),

  crearDisponibilidad: (payload: DisponibilidadCreate): Promise<DisponibilidadItem> =>
    apiClient.post<DisponibilidadItem>('/citas/disponibilidad', payload).then(r => r.data),

  listCitas: (params?: { estado?: EstadoCita }): Promise<CitaItem[]> =>
    apiClient.get<CitaItem[]>('/citas', { params }).then(r => r.data),

  actualizarCita: (id: string, payload: CitaUpdate): Promise<CitaItem> =>
    apiClient.patch<CitaItem>(`/citas/${id}`, payload).then(r => r.data),
};
