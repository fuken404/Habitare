import { apiClient } from '@/core/api/client';

export interface ResidenteUnidadItem {
  id: string;
  nombre: string;
  apellido: string;
  avatar_url: string | null;
}

export interface UnidadDetalle {
  id: string;
  numero: string;
  tipo: 'apartamento' | 'casa' | 'local' | 'oficina';
  area_m2: number | null;
  piso: number | null;
  habitada: boolean;
  torre_id: string | null;
  nombre_torre: string | null;
  residentes: ResidenteUnidadItem[];
  created_at: string;
}

export interface Torre {
  id: string;
  nombre: string;
}

export interface CrearUnidadPayload {
  numero: string;
  tipo: 'apartamento' | 'casa' | 'local' | 'oficina';
  torre_id?: string;
  piso?: number;
  area_m2?: number;
}

export interface EditarUnidadPayload {
  numero?: string;
  tipo?: 'apartamento' | 'casa' | 'local' | 'oficina';
  torre_id?: string | null;
  piso?: number | null;
  area_m2?: number | null;
}

export const unitsApi = {
  listDetalle: (): Promise<UnidadDetalle[]> =>
    apiClient.get<UnidadDetalle[]>('/unidades/detalle').then(r => r.data),

  getTorres: (): Promise<Torre[]> =>
    apiClient.get<Torre[]>('/torres').then(r => r.data),

  crear: (payload: CrearUnidadPayload): Promise<{ id: string }> =>
    apiClient.post<{ id: string }>('/unidades', payload).then(r => r.data),

  editar: (id: string, payload: EditarUnidadPayload): Promise<void> =>
    apiClient.patch(`/unidades/${id}`, payload).then(() => undefined),

  eliminar: (id: string): Promise<void> =>
    apiClient.delete(`/unidades/${id}`).then(() => undefined),
};
