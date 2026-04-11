import { apiClient } from '@/core/api/client';

export type EstadoAutorizacion = 'pendiente' | 'activa' | 'utilizada' | 'cancelada' | 'vencida';

export interface Visitante {
  id: string;
  tipo_documento: string;
  n_documento: string;
  nombre: string;
  apellido: string | null;
}

export interface VehiculoVisitante {
  id: string;
  tipo: string;
  placa: string;
  marca: string | null;
  modelo: string | null;
  color: string | null;
}

export interface Autorizacion {
  id: string;
  tenant_id: string;
  unidad_id: string;
  numero_unidad: string | null;
  nombre_torre: string | null;
  visitante: Visitante;
  autorizado_por: string;
  nombre_autorizado_por: string | null;
  fecha_visita: string;
  requiere_parqueadero: boolean;
  estado: EstadoAutorizacion;
  vehiculos: VehiculoVisitante[];
  created_at: string;
}

export interface Ingreso {
  id: string;
  autorizacion_id: string | null;
  visitante: Visitante;
  registrado_por: string;
  fecha_hora_ingreso: string;
}

export interface ParqueaderoActivo {
  id: string;
  ingreso_visita_id: string;
  numero: string;
}

export interface RegistrarIngresoPayload {
  autorizacion_id?: string;
  visitante_documento?: string;
  tipo_vehiculo?: string;
  placa?: string;
}

export interface CrearAutorizacionPayload {
  visitante: {
    tipo_documento: string;
    n_documento: string;
    nombre: string;
    apellido?: string;
  };
  unidad_id: string;
  fecha_visita: string;
  requiere_parqueadero?: boolean;
}

export const visitorsApi = {
  getAutorizaciones: (fecha?: string) =>
    apiClient
      .get<Autorizacion[]>('/visitors/autorizaciones', { params: fecha ? { fecha } : {} })
      .then((r) => r.data),

  crearAutorizacion: (data: CrearAutorizacionPayload) =>
    apiClient.post<Autorizacion>('/visitors/autorizaciones', data).then((r) => r.data),

  getIngresos: (fecha?: string) =>
    apiClient
      .get<Ingreso[]>('/visitors/ingresos', { params: fecha ? { fecha } : {} })
      .then((r) => r.data),

  registrarIngreso: (data: RegistrarIngresoPayload) =>
    apiClient.post<Ingreso>('/visitors/ingresos', data).then((r) => r.data),

  getParqueaderosActivos: () =>
    apiClient.get<ParqueaderoActivo[]>('/parqueadero-visitantes').then((r) => r.data),
};
