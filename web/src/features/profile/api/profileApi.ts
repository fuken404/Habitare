import { apiClient } from '@/core/api/client';

export interface ProfileData {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  tipo_documento: string;
  n_documento: string;
  telefono: string | null;
  avatar_url: string | null;
}

export const profileApi = {
  getMe: (): Promise<ProfileData> =>
    apiClient.get<ProfileData>('/usuarios/me').then(r => r.data),

  update: (userId: string, patch: { email?: string; avatar_url?: string | null }): Promise<ProfileData> =>
    apiClient.patch<ProfileData>(`/usuarios/${userId}`, patch).then(r => r.data),

  changePassword: (password_actual: string, password_nueva: string): Promise<void> =>
    apiClient.post('/usuarios/me/cambiar-password', { password_actual, password_nueva }).then(() => undefined),
};
