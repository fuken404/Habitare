import { apiClient } from '@/core/api/client';

export interface ZonaComunItem {
  id: string;
  nombre: string;
  capacidad_maxima: number | null;
  requiere_aprobacion: boolean;
  is_activa: boolean;
}

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface ReservaItem {
  id: string;
  zona_comun_id: string;
  unidad_id: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  estado: EstadoReserva;
  nombre_residente: string | null;
  numero_unidad: string | null;
  nombre_torre: string | null;
}

export const commonAreasApi = {
  listZonas: async (): Promise<ZonaComunItem[]> => {
    const { data } = await apiClient.get<ZonaComunItem[]>('/common-areas');
    return data;
  },

  listReservasByZona: async (zonaId: string): Promise<ReservaItem[]> => {
    const { data } = await apiClient.get<ReservaItem[]>('/common-areas/reservas', {
      params: { zona_id: zonaId },
    });
    return data;
  },

  confirmarReserva: async (id: string): Promise<void> => {
    await apiClient.patch(`/common-areas/reservas/${id}`, { estado: 'confirmada' });
  },

  rechazarReserva: async (id: string, motivo: string): Promise<void> => {
    await apiClient.patch(`/common-areas/reservas/${id}`, { estado: 'cancelada', observaciones: motivo });
  },

  actualizarZona: async (id: string, data: { requiere_aprobacion?: boolean; is_activa?: boolean }): Promise<void> => {
    await apiClient.patch(`/common-areas/${id}`, data);
  },
};
