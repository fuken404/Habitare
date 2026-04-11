import { apiClient } from '@/core/api/client';

export interface IngresoExterno {
  id: string;
  nombre: string;
  empresa: string | null;
  motivo: string;
  fecha_hora_ingreso: string;
  fecha_hora_salida: string | null;
}

export const securityApi = {
  listActivos: (): Promise<IngresoExterno[]> =>
    apiClient.get<IngresoExterno[]>('/external-personnel', { params: { activos: true } }).then(r => r.data),

  listHistoricoHoy: (): Promise<IngresoExterno[]> =>
    apiClient.get<IngresoExterno[]>('/external-personnel', { params: { activos: false } }).then(r => r.data),

  registrarIngreso: (payload: { nombre: string; empresa?: string; motivo: string }): Promise<IngresoExterno> =>
    apiClient.post<IngresoExterno>('/external-personnel', payload).then(r => r.data),

  registrarSalida: (id: string): Promise<IngresoExterno> =>
    apiClient.post<IngresoExterno>(`/external-personnel/${id}/checkout`).then(r => r.data),
};
