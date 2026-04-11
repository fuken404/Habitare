import { apiClient } from '@/core/api/client';

export type EstadoPaquete = 'pendiente' | 'retirado';

export interface PaqueteItem {
  id: string;
  unidad_id: string;
  estado: EstadoPaquete;
  retirado_por_nombre: string | null;
  fecha_recepcion: string;
  fecha_entrega: string | null;
  numero_unidad: string | null;
  nombre_torre: string | null;
}

export interface UnidadOption {
  id: string;
  numero: string;
  nombre_torre?: string | null;
}

export const packagesApi = {
  listEnPorteria: (): Promise<PaqueteItem[]> =>
    apiClient.get<PaqueteItem[]>('/paquetes', { params: { estado: 'pendiente' } }).then(r => r.data),

  listRetiradosSemana: (): Promise<PaqueteItem[]> =>
    apiClient.get<PaqueteItem[]>('/paquetes', { params: { estado: 'retirado', solo_semana: true } }).then(r => r.data),

  registrar: (payload: { unidad_id: string }): Promise<void> =>
    apiClient.post('/paquetes', payload).then(() => undefined),

  entregar: (id: string, retirado_por_nombre?: string): Promise<void> =>
    apiClient.patch(`/paquetes/${id}/entregar`, { retirado_por_nombre: retirado_por_nombre ?? null }).then(() => undefined),
};
