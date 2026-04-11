import { apiClient } from '@/core/api/client';

export type EstadoIncidente = 'reportado' | 'en_atencion' | 'resuelto' | 'cerrado';
export type SeveridadIncidente = 'baja' | 'media' | 'alta' | 'critica';

export interface TipoIncidente {
  id: string;
  tenant_id: string;
  nombre: string;
  descripcion: string | null;
  created_at: string;
}

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
  rol_reportado_por: string | null;
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
  tenant_id: string;
  tipo_id: string;
  unidad_id: string | null;
  reportado_por: string;
  titulo: string;
  descripcion: string;
  ubicacion: string | null;
  estado: EstadoIncidente;
  severidad: SeveridadIncidente;
  numero_radicado: string | null;
  fecha_resolucion: string | null;
  actualizaciones: Actualizacion[];
  created_at: string;
  updated_at: string;
}

export interface CrearIncidentePayload {
  tipo_id: string;
  titulo: string;
  descripcion: string;
  severidad: SeveridadIncidente;
  ubicacion?: string;
  unidad_id?: string;
}

export const incidentsApi = {
  list: (estado?: EstadoIncidente): Promise<IncidenteListItem[]> => {
    const params = estado ? { estado } : {};
    return apiClient.get<IncidenteListItem[]>('/incidents', { params }).then(r => r.data);
  },

  getById: (id: string): Promise<IncidenteDetalle> =>
    apiClient.get<IncidenteDetalle>(`/incidents/${id}`).then(r => r.data),

  getTipos: (): Promise<TipoIncidente[]> =>
    apiClient.get<TipoIncidente[]>('/incidents/tipos').then(r => r.data),

  crear: (payload: CrearIncidentePayload): Promise<IncidenteDetalle> =>
    apiClient.post<IncidenteDetalle>('/incidents', payload).then(r => r.data),

  avanzarEstado: (id: string, estado: EstadoIncidente): Promise<IncidenteDetalle> =>
    apiClient.patch<IncidenteDetalle>(`/incidents/${id}`, { estado }).then(r => r.data),

  crearTipo: (nombre: string, descripcion?: string): Promise<TipoIncidente> =>
    apiClient.post<TipoIncidente>('/incidents/tipos', { nombre, descripcion }).then(r => r.data),

  eliminarTipo: (tipo_id: string): Promise<void> =>
    apiClient.delete(`/incidents/tipos/${tipo_id}`).then(() => undefined),

  agregarActualizacion: (incidente_id: string, descripcion: string): Promise<Actualizacion> =>
    apiClient
      .post<Actualizacion>(`/incidents/${incidente_id}/actualizaciones`, { descripcion })
      .then(r => r.data),
};
