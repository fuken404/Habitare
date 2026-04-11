import { apiClient } from '@/core/api/client';

export type EstadoIncidente = 'reportado' | 'en_atencion' | 'resuelto' | 'cerrado';
export type SeveridadIncidente = 'baja' | 'media' | 'alta' | 'critica';

export interface IncidenteListItem {
  id: string;
  numero_radicado: string | null;
  tipo_id: string;
  tipo_nombre: string;
  titulo: string;
  estado: EstadoIncidente;
  severidad: SeveridadIncidente;
  reportado_por: string;
  nombre_reportado_por: string | null;
  created_at: string;
}

export interface Actualizacion {
  id: string;
  usuario_id: string;
  descripcion: string;
  created_at: string;
}

export interface IncidenteDetalle {
  id: string;
  numero_radicado: string | null;
  tipo_id: string;
  titulo: string;
  descripcion: string;
  ubicacion: string | null;
  estado: EstadoIncidente;
  severidad: SeveridadIncidente;
  fecha_resolucion: string | null;
  actualizaciones: Actualizacion[];
  created_at: string;
  updated_at: string;
}

export interface TipoIncidente {
  id: string;
  nombre: string;
}

export interface CrearIncidentePayload {
  tipo_id: string;
  titulo: string;
  descripcion: string;
  severidad?: SeveridadIncidente;
  ubicacion?: string;
}

// Transiciones válidas por estado
export const TRANSICIONES: Record<EstadoIncidente, EstadoIncidente[]> = {
  reportado:   ['en_atencion', 'cerrado'],
  en_atencion: ['resuelto', 'cerrado'],
  resuelto:    ['cerrado'],
  cerrado:     [],
};

export const reportsApi = {
  getIncidentes: (estado?: EstadoIncidente) =>
    apiClient
      .get<IncidenteListItem[]>('/incidents', { params: estado ? { estado } : {} })
      .then((r) => r.data),

  getIncidente: (id: string) =>
    apiClient.get<IncidenteDetalle>(`/incidents/${id}`).then((r) => r.data),

  getTipos: () =>
    apiClient.get<TipoIncidente[]>('/incidents/tipos').then((r) => r.data),

  crearIncidente: (data: CrearIncidentePayload) =>
    apiClient.post('/incidents', data).then((r) => r.data),

  actualizarEstado: (id: string, estado: EstadoIncidente) =>
    apiClient.patch<IncidenteDetalle>(`/incidents/${id}`, { estado }).then((r) => r.data),

  agregarActualizacion: (id: string, descripcion: string) =>
    apiClient.post(`/incidents/${id}/actualizaciones`, { descripcion }).then((r) => r.data),
};
