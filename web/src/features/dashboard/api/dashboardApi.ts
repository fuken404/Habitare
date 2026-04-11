import { apiClient } from '@/core/api/client';

export interface IngresoHoy {
  id: string;
  autorizacion_id: string | null;
  visitante: {
    tipo_documento: string;
    n_documento: string;
    nombre: string;
    apellido: string | null;
  };
  fecha_hora_ingreso: string;
}

export interface Autorizacion {
  id: string;
  numero_unidad: string | null;
  nombre_torre: string | null;
  nombre_autorizado_por: string | null;
  estado: string;
}

export interface PaquetePendiente {
  id: string;
  estado: string;
}

export interface LugarParqueadero {
  id: string;
  is_ocupado: boolean;
  is_activo: boolean;
}

export interface ParqueaderoActivo {
  id: string;
  ingreso_visita_id: string;
  numero: string;
}

export const dashboardApi = {
  getIngresos: () =>
    apiClient.get<IngresoHoy[]>('/visitors/ingresos').then((r) => r.data),

  getAutorizaciones: () =>
    apiClient.get<Autorizacion[]>('/visitors/autorizaciones').then((r) => r.data),

  getPaquetes: () =>
    apiClient.get<PaquetePendiente[]>('/paquetes').then((r) => r.data),

  getLugares: () =>
    apiClient.get<LugarParqueadero[]>('/parqueadero-visitantes/lugares').then((r) => r.data),

  getParqueaderosActivos: () =>
    apiClient.get<ParqueaderoActivo[]>('/parqueadero-visitantes').then((r) => r.data),
};
