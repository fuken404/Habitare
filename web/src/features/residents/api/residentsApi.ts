import { apiClient } from '@/core/api/client';

export interface Residente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  tipo_documento: string;
  n_documento: string;
  telefono: string | null;
  avatar_url: string | null;
  is_activo: boolean;
  unidad_id: string;
  numero_unidad: string | null;
  nombre_torre: string | null;
  created_at: string;
  fecha_salida: string | null;
}

export interface CrearResidentePayload {
  email: string;
  nombre: string;
  apellido: string;
  tipo_documento: 'CC' | 'CE' | 'PA' | 'TI' | 'otro';
  n_documento: string;
  telefono?: string;
  password: string;
}

export const residentsApi = {
  list: (): Promise<Residente[]> =>
    apiClient.get<Residente[]>('/usuarios/residentes').then(r => r.data),

  listInactivos: (): Promise<Residente[]> =>
    apiClient.get<Residente[]>('/usuarios/residentes/inactivos').then(r => r.data),

  crear: (payload: CrearResidentePayload): Promise<{ id: string }> =>
    apiClient.post<{ id: string }>('/usuarios', payload).then(r => r.data),

  asignar: (usuario_id: string, unidad_id: string): Promise<void> =>
    apiClient.post('/usuarios/asignar', {
      usuario_id,
      unidad_id,
      rol: 'residente',
      fecha_inicio: new Date().toISOString().slice(0, 10),
    }).then(() => undefined),

  desactivar: (userId: string): Promise<void> =>
    apiClient.delete(`/usuarios/${userId}/remover`).then(() => undefined),
};
