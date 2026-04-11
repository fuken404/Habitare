import { apiClient } from '@/core/api/client';

export interface StaffMember {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  tipo_documento: string;
  n_documento: string;
  telefono: string | null;
  avatar_url: string | null;
  rol: 'seguridad' | 'recepcion';
  fecha_inicio: string;
  created_at: string;
  fecha_salida?: string | null;
}

export interface CrearStaffPayload {
  email: string;
  nombre: string;
  apellido: string;
  tipo_documento: 'CC' | 'CE' | 'PA' | 'TI' | 'otro';
  n_documento: string;
  telefono?: string;
  password: string;
}

export const usersApi = {
  listStaff: (): Promise<StaffMember[]> =>
    apiClient.get<StaffMember[]>('/usuarios/staff').then(r => r.data),

  listStaffInactivos: (): Promise<StaffMember[]> =>
    apiClient.get<StaffMember[]>('/usuarios/staff/inactivos').then(r => r.data),

  crear: (payload: CrearStaffPayload): Promise<{ id: string }> =>
    apiClient.post<{ id: string }>('/usuarios', payload).then(r => r.data),

  asignar: (usuario_id: string, rol: 'seguridad' | 'recepcion'): Promise<void> =>
    apiClient.post('/usuarios/asignar', {
      usuario_id,
      rol,
      fecha_inicio: new Date().toISOString().slice(0, 10),
    }).then(() => undefined),

  inactivar: (usuario_id: string): Promise<void> =>
    apiClient.delete(`/usuarios/${usuario_id}/remover`).then(() => undefined),
};
