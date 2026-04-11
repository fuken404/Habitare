import { apiClient } from '@/core/api/client';

export type EstadoPQRS    = 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada' | 'rechazada';
export type PrioridadPQRS = 'baja' | 'media' | 'alta' | 'urgente';
export type TipoPQRS      = 'peticion' | 'queja' | 'reclamo' | 'sugerencia';

export interface PqrsListItem {
  id: string;
  numero_radicado: string | null;
  tipo: TipoPQRS | null;
  asunto: string;
  estado: EstadoPQRS;
  prioridad: PrioridadPQRS;
  radicado_por: string;
  nombre_radicador: string | null;
  unidad_id: string;
  numero_unidad: string | null;
  nombre_torre: string | null;
  created_at: string;
}

export interface MensajeItem {
  id: string;
  autor_id: string;
  nombre_autor: string | null;
  contenido: string;
  is_interno: boolean;
  created_at: string;
}

export interface AdjuntoItem {
  id: string;
  nombre: string;
  mime_type: string | null;
  contenido_b64: string;
  created_at: string;
}

export interface PqrsDetalle {
  id: string;
  tenant_id: string;
  unidad_id: string;
  tipo: TipoPQRS | null;
  radicado_por: string;
  asunto: string;
  descripcion: string;
  estado: EstadoPQRS;
  prioridad: PrioridadPQRS;
  numero_radicado: string | null;
  fecha_primera_respuesta: string | null;
  fecha_resolucion: string | null;
  mensajes: MensajeItem[];
  adjuntos: AdjuntoItem[];
  created_at: string;
  updated_at: string;
}

export const pqrsApi = {
  list: (estado?: EstadoPQRS): Promise<PqrsListItem[]> =>
    apiClient.get<PqrsListItem[]>('/pqrs', { params: estado ? { estado } : {} }).then(r => r.data),

  getById: (id: string): Promise<PqrsDetalle> =>
    apiClient.get<PqrsDetalle>(`/pqrs/${id}`).then(r => r.data),

  actualizarEstado: (id: string, estado: EstadoPQRS): Promise<PqrsDetalle> =>
    apiClient.patch<PqrsDetalle>(`/pqrs/${id}`, { estado }).then(r => r.data),

  rechazar: (id: string): Promise<PqrsDetalle> =>
    apiClient.patch<PqrsDetalle>(`/pqrs/${id}`, { estado: 'rechazada' }).then(r => r.data),

  agregarMensaje: (id: string, contenido: string, is_interno = false): Promise<MensajeItem> =>
    apiClient.post<MensajeItem>(`/pqrs/${id}/mensajes`, { contenido, is_interno }).then(r => r.data),
};
