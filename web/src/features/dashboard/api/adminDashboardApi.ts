import { apiClient } from '@/core/api/client';

export interface AdminUsuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  is_activo: boolean;
}

export interface AdminUnidad {
  id: string;
  numero: string;
}

export interface AdminPqrs {
  id: string;
  asunto: string;
  estado: 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada' | 'rechazada';
  prioridad: 'baja' | 'media' | 'alta';
  created_at: string;
}

export interface AdminFactura {
  id: string;
  numero_factura: string;
  periodo: string;
  fecha_vencimiento: string;
  monto_total: number;
  estado: 'pendiente' | 'pagada' | 'vencida';
}

export interface AdminReserva {
  id: string;
  zona_comun_id: string;
  unidad_id: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  nombre_residente: string | null;
  numero_unidad: string | null;
  nombre_torre: string | null;
}

export interface AdminIncidente {
  id: string;
  titulo: string;
  tipo_nombre: string;
  estado: 'reportado' | 'en_atencion' | 'resuelto' | 'cerrado';
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  nombre_reportado_por: string | null;
  created_at: string;
}

export interface AdminZona {
  id: string;
  nombre: string;
}

export const adminDashboardApi = {
  getUsuarios: (): Promise<AdminUsuario[]> =>
    apiClient.get<AdminUsuario[]>('/usuarios').then(r => r.data),

  getUnidades: (): Promise<AdminUnidad[]> =>
    apiClient.get<AdminUnidad[]>('/unidades').then(r => r.data),

  getPqrs: (): Promise<AdminPqrs[]> =>
    apiClient.get<AdminPqrs[]>('/pqrs').then(r => r.data),

  getFacturasVencidas: (): Promise<AdminFactura[]> =>
    apiClient.get<AdminFactura[]>('/billing/facturas', { params: { estado: 'vencida' } }).then(r => r.data),

  getReservasPendientes: (): Promise<AdminReserva[]> =>
    apiClient.get<AdminReserva[]>('/common-areas/reservas', { params: { estado: 'pendiente' } }).then(r => r.data),

  getIncidentes: (): Promise<AdminIncidente[]> =>
    apiClient.get<AdminIncidente[]>('/incidents').then(r => r.data),

  getZonas: (): Promise<AdminZona[]> =>
    apiClient.get<AdminZona[]>('/common-areas').then(r => r.data),

  confirmarReserva: (id: string): Promise<void> =>
    apiClient.patch(`/common-areas/reservas/${id}`, { estado: 'confirmada' }).then(() => undefined),
};
