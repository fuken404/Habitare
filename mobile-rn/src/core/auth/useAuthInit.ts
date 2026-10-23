import apiClient from '../api/client';
import { useAuthStore } from './authStore';
import { useEffect, useState } from 'react';

interface MeResponse {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  tenant_id: string;
  unidad_id?: string;
  numero_unidad?: string;
}

export function useAuthInit() {
  const { loadStoredToken, setAuth, logout } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await loadStoredToken();
      if (token) {
        try {
          const { data } = await apiClient.get<MeResponse>('/auth/me');
          await setAuth(
            {
              id: data.id,
              nombre: data.nombre,
              apellido: data.apellido,
              email: data.email,
              rol: data.rol as any,
              tenantId: data.tenant_id,
              unidadId: data.unidad_id,
              numeroUnidad: data.numero_unidad,
            },
            token,
            ''
          );
        } catch {
          await logout();
        }
      }
      setReady(true);
    })();
  }, []);

  return ready;
}
