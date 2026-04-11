import { apiClient } from '@/core/api/client';

export type EstadoFactura = 'pendiente' | 'pagada' | 'vencida' | 'anulada';
export type EstadoPago    = 'pendiente' | 'aprobado' | 'rechazado';
export type MetodoPago    = 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';

export interface FacturaListItem {
  id: string;
  unidad_id: string;
  numero_factura: string;
  periodo: string;
  fecha_vencimiento: string;
  monto_total: number;
  estado: EstadoFactura;
  numero_unidad: string | null;
  nombre_torre: string | null;
}

export interface PagoItem {
  id: string;
  monto: number;
  fecha_pago: string;
  metodo_pago: MetodoPago;
  referencia: string | null;
  estado: EstadoPago;
}

export interface FacturaDetalle {
  id: string;
  tenant_id: string;
  unidad_id: string;
  numero_factura: string;
  periodo: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  monto_total: number;
  descripcion: string | null;
  estado: EstadoFactura;
  pagos: PagoItem[];
  created_at: string;
  updated_at: string;
}

export interface CrearFacturaPayload {
  unidad_id: string;
  numero_factura: string;
  periodo: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  monto_total: number;
  descripcion?: string;
}

export interface RegistrarPagoPayload {
  monto: number;
  fecha_pago: string;
  metodo_pago: MetodoPago;
  referencia?: string;
}

export interface UnidadSimple {
  id: string;
  numero: string;
  nombre_torre: string | null;
}

export const billingApi = {
  listFacturas: (estado?: EstadoFactura): Promise<FacturaListItem[]> =>
    apiClient.get<FacturaListItem[]>('/billing/facturas', {
      params: estado ? { estado } : {},
    }).then(r => r.data),

  getFactura: (id: string): Promise<FacturaDetalle> =>
    apiClient.get<FacturaDetalle>(`/billing/facturas/${id}`).then(r => r.data),

  crearFactura: (payload: CrearFacturaPayload): Promise<FacturaDetalle> =>
    apiClient.post<FacturaDetalle>('/billing/facturas', payload).then(r => r.data),

  anularFactura: (id: string): Promise<FacturaDetalle> =>
    apiClient.post<FacturaDetalle>(`/billing/facturas/${id}/void`).then(r => r.data),

  registrarPago: (facturaId: string, payload: RegistrarPagoPayload): Promise<PagoItem> =>
    apiClient.post<PagoItem>(`/billing/facturas/${facturaId}/pagos`, payload).then(r => r.data),

  aprobarPago: (facturaId: string, pagoId: string): Promise<PagoItem> =>
    apiClient.post<PagoItem>(`/billing/facturas/${facturaId}/pagos/${pagoId}/approve`).then(r => r.data),

  rechazarPago: (facturaId: string, pagoId: string): Promise<PagoItem> =>
    apiClient.post<PagoItem>(`/billing/facturas/${facturaId}/pagos/${pagoId}/reject`).then(r => r.data),

  listUnidades: (): Promise<UnidadSimple[]> =>
    apiClient.get<UnidadSimple[]>('/unidades/detalle').then(r => r.data),
};
