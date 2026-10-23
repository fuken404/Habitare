import { pqrsApi } from '@/features/pqrs/api/pqrsApi';
export type {
  EstadoPQRS as EstadoIncidente,
  SeveridadPQRS as SeveridadIncidente,
  TipoIncidente,
  PqrsListItem as IncidenteListItem,
  PqrsDetalle as IncidenteDetalle,
} from '@/features/pqrs/api/pqrsApi';
import type { EstadoPQRS, SeveridadPQRS } from '@/features/pqrs/api/pqrsApi';

export const TRANSICIONES: Record<EstadoPQRS, EstadoPQRS[]> = {
  abierta:    ['en_proceso', 'cerrada'],
  en_proceso: ['resuelta',  'cerrada'],
  resuelta:   ['cerrada'],
  cerrada:    [],
  rechazada:  [],
};

export const reportsApi = {
  getIncidentes: (estado?: EstadoPQRS) =>
    pqrsApi.list({ tipo: 'incidente', estado }),

  getIncidente: (id: string) =>
    pqrsApi.getById(id),

  getTipos: () =>
    pqrsApi.getTiposIncidente(),

  crearIncidente: (data: {
    tipo_id: string;
    titulo: string;
    descripcion: string;
    severidad?: SeveridadPQRS;
    ubicacion?: string;
  }) =>
    pqrsApi.crear({
      tipo: 'incidente',
      tipo_incidente_id: data.tipo_id,
      asunto: data.titulo,
      descripcion: data.descripcion,
      severidad: data.severidad,
      ubicacion: data.ubicacion,
    }),

  actualizarEstado: (id: string, estado: EstadoPQRS) =>
    pqrsApi.actualizarEstado(id, estado),

  agregarActualizacion: (id: string, contenido: string) =>
    pqrsApi.agregarMensaje(id, contenido, false),
};
