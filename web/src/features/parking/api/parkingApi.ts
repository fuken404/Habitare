import { apiClient } from '@/core/api/client';

// ─── Residentes — estado ──────────────────────────────────────────────────────
export interface ParqueaderoEstado {
  id: string;
  numero: string;
  tipo: 'cubierto' | 'descubierto';
  is_ocupado: boolean;
  unidad_id: string | null;
  numero_unidad: string | null;
  nombre_torre: string | null;
}

export interface ParqueaderoCreate {
  numero: string;
  tipo: 'cubierto' | 'descubierto';
}

// ─── Sorteos ──────────────────────────────────────────────────────────────────
export type EstadoSorteo = 'programado' | 'ejecutado' | 'cancelado';

export interface ParticipacionItem {
  id: string;
  unidad_id: string;
  numero_unidad: string | null;
  es_ganador: boolean;
}

export interface SorteoItem {
  id: string;
  fecha_sorteo: string;
  fecha_limite_inscripcion: string | null;
  estado: EstadoSorteo;
  n_cupos: number;
  participaciones: ParticipacionItem[];
  created_at: string;
}

export interface SorteoCreate {
  fecha_sorteo: string; // YYYY-MM-DD
  fecha_limite_inscripcion?: string | null; // YYYY-MM-DD
  n_cupos: number;
}

// ─── Vehículos ────────────────────────────────────────────────────────────────
export interface VehiculoResidente {
  id: string;
  unidad_id: string;
  tipo: 'automovil' | 'motocicleta';
  placa: string;
  marca: string | null;
  modelo: string | null;
  color: string | null;
}

// ─── Visitantes ───────────────────────────────────────────────────────────────
export interface LugarVisitante {
  id: string;
  numero: string;
  tipo: string;
  is_activo: boolean;
  is_ocupado: boolean;
}

export interface ParqueaderoVisitante {
  id: string;
  lugar_id: string;
  numero: string;
  tipo: string;
  tipo_vehiculo: string | null;
  placa: string | null;
  nombre_visitante: string | null;
  fecha_hora_asignacion: string;
  fecha_hora_liberacion: string | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────
export interface ConfigParqueadero {
  requiere_sorteo: boolean;
}

// ─── Unidades (para asignación) ───────────────────────────────────────────────
export interface UnidadItem {
  id: string;
  numero: string;
  nombre_torre: string | null;
}

export const parkingApi = {
  // ── Configuración ────────────────────────────────────────────────────────
  getConfig: (): Promise<ConfigParqueadero> =>
    apiClient.get<ConfigParqueadero>('/parking/config').then(r => r.data),

  updateConfig: (requiere_sorteo: boolean): Promise<ConfigParqueadero> =>
    apiClient.patch<ConfigParqueadero>('/parking/config', { requiere_sorteo }).then(r => r.data),

  // ── Parqueaderos residentes ──────────────────────────────────────────────
  getEstadoResidentes: (): Promise<ParqueaderoEstado[]> =>
    apiClient.get<ParqueaderoEstado[]>('/parking/estado').then(r => r.data),

  crearParqueadero: (body: ParqueaderoCreate): Promise<ParqueaderoEstado> =>
    apiClient.post<ParqueaderoEstado>('/parking/parqueaderos', body).then(r => r.data),

  asignarParqueadero: (parqueadero_id: string, unidad_id: string): Promise<void> =>
    apiClient.post('/parking/asignaciones', {
      parqueadero_id,
      unidad_id,
      fecha_inicio: new Date().toISOString(),
    }).then(() => undefined),

  liberarParqueadero: (parqueadero_id: string): Promise<void> =>
    apiClient.delete(`/parking/asignaciones/${parqueadero_id}/liberar`).then(() => undefined),

  // ── Vehículos ────────────────────────────────────────────────────────────
  listarVehiculos: (): Promise<VehiculoResidente[]> =>
    apiClient.get<VehiculoResidente[]>('/parking/vehiculos').then(r => r.data),

  // ── Sorteos ──────────────────────────────────────────────────────────────
  listarSorteos: (): Promise<SorteoItem[]> =>
    apiClient.get<SorteoItem[]>('/parking/sorteos').then(r => r.data),

  crearSorteo: (body: SorteoCreate): Promise<SorteoItem> =>
    apiClient.post<SorteoItem>('/parking/sorteos', body).then(r => r.data),

  ejecutarSorteo: (sorteo_id: string): Promise<SorteoItem> =>
    apiClient.post<SorteoItem>(`/parking/sorteos/${sorteo_id}/ejecutar`).then(r => r.data),

  // ── Visitantes ───────────────────────────────────────────────────────────
  getLugaresVisitantes: (): Promise<LugarVisitante[]> =>
    apiClient.get<LugarVisitante[]>('/parqueadero-visitantes/lugares').then(r => r.data),

  getActivosVisitantes: (): Promise<ParqueaderoVisitante[]> =>
    apiClient.get<ParqueaderoVisitante[]>('/parqueadero-visitantes').then(r => r.data),

  liberarVisitante: (id: string): Promise<void> =>
    apiClient.patch(`/parqueadero-visitantes/${id}/liberar`).then(() => undefined),

  // ── Unidades ─────────────────────────────────────────────────────────────
  listarUnidades: (): Promise<UnidadItem[]> =>
    apiClient.get<UnidadItem[]>('/unidades/detalle').then(r => r.data),
};
