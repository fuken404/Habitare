import { apiClient } from '@/core/api/client';

// ─── Tipos auxiliares para segmentación ──────────────────────────────────────
export interface TorreItem {
  id: string;
  nombre: string;
  n_pisos: number | null;
}

export interface UnidadDetalleItem {
  id: string;
  numero: string;
  piso: number | null;
  torre_id: string | null;
  nombre_torre: string | null;
  habitada: boolean;
}

export interface FacturaListItem {
  id: string;
  unidad_id: string;
  estado: string;
  monto_total: number;
  numero_unidad: string | null;
  nombre_torre: string | null;
}

export type TipoComunicado    = 'informativo' | 'urgente' | 'evento' | 'mantenimiento';
export type EstadoComunicado  = 'borrador' | 'publicado' | 'archivado';
export type TipoSegmentacion  = 'todos' | 'torre' | 'unidad' | 'rol';

export interface ComunicadoListItem {
  id: string;
  titulo: string;
  tipo: TipoComunicado;
  estado: EstadoComunicado;
  autor_id: string;
  nombre_autor: string | null;
  fecha_publicacion: string | null;
  created_at: string;
}

export interface SegmentacionItem {
  id: string;
  tipo: TipoSegmentacion;
  torre_id: string | null;
  unidad_id: string | null;
  rol_id: string | null;
}

export interface ComunicadoDetalle {
  id: string;
  tenant_id: string;
  autor_id: string;
  titulo: string;
  contenido: string;
  tipo: TipoComunicado;
  estado: EstadoComunicado;
  fecha_publicacion: string | null;
  segmentaciones: SegmentacionItem[];
  created_at: string;
  updated_at: string;
}

export interface CrearComunicadoPayload {
  titulo: string;
  contenido: string;
  tipo: TipoComunicado;
  segmentaciones: { tipo: TipoSegmentacion; torre_id?: string; unidad_id?: string; rol_id?: string }[];
}

export const communicationsApi = {
  list: (estado?: EstadoComunicado): Promise<ComunicadoListItem[]> =>
    apiClient.get<ComunicadoListItem[]>('/communications', {
      params: estado ? { estado } : {},
    }).then(r => r.data),

  getById: (id: string): Promise<ComunicadoDetalle> =>
    apiClient.get<ComunicadoDetalle>(`/communications/${id}`).then(r => r.data),

  crear: (payload: CrearComunicadoPayload): Promise<ComunicadoDetalle> =>
    apiClient.post<ComunicadoDetalle>('/communications', payload).then(r => r.data),

  publicar: (id: string): Promise<ComunicadoDetalle> =>
    apiClient.post<ComunicadoDetalle>(`/communications/${id}/publish`).then(r => r.data),

  archivar: (id: string): Promise<ComunicadoDetalle> =>
    apiClient.post<ComunicadoDetalle>(`/communications/${id}/archive`).then(r => r.data),

  eliminar: (id: string): Promise<void> =>
    apiClient.delete(`/communications/${id}`).then(() => undefined),

  // ── Datos para segmentación ───────────────────────────────────────────────
  listarTorres: (): Promise<TorreItem[]> =>
    apiClient.get<TorreItem[]>('/torres').then(r => r.data),

  listarUnidades: (): Promise<UnidadDetalleItem[]> =>
    apiClient.get<UnidadDetalleItem[]>('/unidades/detalle').then(r => r.data),

  listarFacturasVencidas: (): Promise<FacturaListItem[]> =>
    apiClient.get<FacturaListItem[]>('/billing/facturas', { params: { estado: 'vencida' } }).then(r => r.data),
};
