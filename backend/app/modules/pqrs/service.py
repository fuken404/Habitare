import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pqrs import repository as repo
from app.modules.pqrs.models import EstadoPQRS, PrioridadPQRS, TipoPQRS
from app.modules.pqrs.schemas import (
    TipoIncidenteCreate, TipoIncidenteUpdate, TipoIncidenteResponse,
    CategoriaPQRSCreate, CategoriaPQRSUpdate, CategoriaPQRSResponse,
    PQRSCreate, PQRSUpdate, PQRSResponse, PQRSListResponse,
    MensajePQRSCreate, MensajePQRSResponse,
  )
from app.modules.users.models import TipoRol

_LABEL_ESTADO: dict[EstadoPQRS, str] = {
    EstadoPQRS.ABIERTA:     "Abierta",
    EstadoPQRS.EN_PROCESO:  "En proceso",
    EstadoPQRS.RESUELTA:    "Resuelta",
    EstadoPQRS.CERRADA:     "Cerrada",
    EstadoPQRS.RECHAZADA:   "Rechazada",
}

# Transiciones válidas por estado
_TRANSICIONES: dict[EstadoPQRS, list[EstadoPQRS]] = {
    EstadoPQRS.ABIERTA:     [EstadoPQRS.EN_PROCESO, EstadoPQRS.RECHAZADA],
    EstadoPQRS.EN_PROCESO:  [EstadoPQRS.RESUELTA, EstadoPQRS.RECHAZADA],
    EstadoPQRS.RESUELTA:    [EstadoPQRS.CERRADA],
    EstadoPQRS.CERRADA:     [],
    EstadoPQRS.RECHAZADA:   [],
  }

_ESTADOS_FINALES = {EstadoPQRS.CERRADA, EstadoPQRS.RECHAZADA}

# ======================================
#        TIPO DE INCIDENTE
# ======================================

async def listar_tipos_incidente(
    tenant_id: uuid.UUID, db: AsyncSession
  ) -> list[TipoIncidenteResponse]:
  items = await repo.get_tipos_incidente(db, tenant_id)
  return [TipoIncidenteResponse.model_validate(t) for t in items]

async def crear_tipo_incidente(
    tenant_id: uuid.UUID, data: TipoIncidenteCreate, db: AsyncSession
  ) -> TipoIncidenteResponse:
  tipo = await repo.create_tipo_incidente(db, {"tenant_id": tenant_id, **data.model_dump()})
  return TipoIncidenteResponse.model_validate(tipo)

async def actualizar_tipo_incidente(
    tipo_id: uuid.UUID, tenant_id: uuid.UUID,
    data: TipoIncidenteUpdate, db: AsyncSession
  ) -> TipoIncidenteResponse:
  tipo = await repo.get_tipo_incidente_by_id(db, tipo_id, tenant_id)
  if not tipo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tipo de incidente no encontrado")
  tipo = await repo.update_tipo_incidente(db, tipo, data.model_dump(exclude_none=True))
  return TipoIncidenteResponse.model_validate(tipo)

async def eliminar_tipo_incidente(
    tipo_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> None:
  tipo = await repo.get_tipo_incidente_by_id(db, tipo_id, tenant_id)
  if not tipo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tipo de incidente no encontrado")
  # Verificar que no haya PQRS de tipo incidente usando este tipo
  pqrs_asociadas = await repo.get_pqrs_list(db, tenant_id, tipo=TipoPQRS.INCIDENTE)
  if any(str(p.tipo_incidente_id) == str(tipo_id) for p in pqrs_asociadas):
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="No se puede eliminar: existen incidentes asociados a este tipo"
    )
  await repo.delete_tipo_incidente(db, tipo)

# ======================================
#          CATEGORÍA PQRS
# ======================================

async def listar_categorias(
    db: AsyncSession, solo_activas: bool = True
  ) -> list[CategoriaPQRSResponse]:
  items = await repo.get_categorias(db, solo_activas)
  return [CategoriaPQRSResponse.model_validate(c) for c in items]

async def crear_categoria(
    data: CategoriaPQRSCreate, db: AsyncSession
  ) -> CategoriaPQRSResponse:
  categoria = await repo.create_categoria(db, data.model_dump())
  return CategoriaPQRSResponse.model_validate(categoria)

async def actualizar_categoria(
    categoria_id: uuid.UUID, data: CategoriaPQRSUpdate, db: AsyncSession
  ) -> CategoriaPQRSResponse:
  categoria = await repo.get_categoria_by_id(db, categoria_id)
  if not categoria:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
  categoria = await repo.update_categoria(db, categoria, data.model_dump(exclude_none=True))
  return CategoriaPQRSResponse.model_validate(categoria)

# ======================================
#               PQRS
# ======================================

async def listar_pqrs(
    tenant_id: uuid.UUID,
    estado: EstadoPQRS | None,
    unidad_id: uuid.UUID | None,
    db: AsyncSession,
    tipo: TipoPQRS | None = None,
  ) -> list[PQRSListResponse]:
  items = await repo.get_pqrs_list(db, tenant_id, estado, unidad_id, tipo)
  return [PQRSListResponse.from_orm_pqrs(p) for p in items]

async def obtener_pqrs(
    pqrs_id: uuid.UUID,
    tenant_id: uuid.UUID,
    rol_usuario: TipoRol,
    db: AsyncSession,
  ) -> PQRSResponse:
  # Los residentes no ven mensajes internos
  es_admin = rol_usuario in (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
  pqrs = await repo.get_pqrs_by_id(db, pqrs_id, tenant_id, include_internos=es_admin)
  if not pqrs:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRS no encontrada")
  return PQRSResponse.from_orm_pqrs(pqrs)

async def crear_pqrs(
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    data: PQRSCreate,
    db: AsyncSession,
  ) -> PQRSResponse:
  es_incidente = data.tipo == TipoPQRS.INCIDENTE
  # Validar tipo_incidente_id cuando es incidente
  if es_incidente and data.tipo_incidente_id:
    tipo_inc = await repo.get_tipo_incidente_by_id(db, data.tipo_incidente_id, tenant_id)
    if not tipo_inc:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tipo de incidente no encontrado")
  year = datetime.now().year
  count = await repo.count_pqrs_by_year(db, tenant_id, year)
  prefix = "INC" if es_incidente else "PQRS"
  numero_radicado = f"{prefix}-{year}-{count + 1:03d}"
  pqrs = await repo.create_pqrs(db, {
    "tenant_id": tenant_id,
    "radicado_por": usuario_id,
    "estado": EstadoPQRS.ABIERTA,
    "numero_radicado": numero_radicado,
    **data.model_dump(exclude={"adjuntos"}),
  })
  # Mensaje inicial automático con la descripción del radicado
  await repo.create_mensaje(
    db, pqrs.id, usuario_id,
    contenido=data.descripcion,
    is_interno=False,
  )
  # Adjuntos
  for adj in data.adjuntos:
    await repo.create_adjunto(
      db, pqrs.id, adj.nombre, adj.mime_type, adj.contenido_b64
    )
  # Notificar a seguridad cuando es incidente
  if es_incidente:
    try:
      from app.modules.users.repository import get_usuario_ids_by_rol
      from app.modules.notifications import service as notif_service
      from app.modules.notifications.schemas import NotificacionCreate
      from app.modules.notifications.models import TipoNotificacion, CanalNotificacion
      seguridad_ids = await get_usuario_ids_by_rol(db, tenant_id, TipoRol.SEGURIDAD)
      for seg_id in seguridad_ids:
        await notif_service.crear_notificacion(
          tenant_id,
          NotificacionCreate(
            usuario_id=seg_id,
            titulo="Nueva novedad reportada",
            mensaje=pqrs.asunto,
            tipo=TipoNotificacion.ALERTA,
            canal=CanalNotificacion.PUSH,
            entidad_tipo="pqrs",
            entidad_id=pqrs.id,
          ),
          db,
        )
    except Exception:
      pass  # Las notificaciones son best-effort
  pqrs = await repo.get_pqrs_by_id(db, pqrs.id, tenant_id)
  return PQRSResponse.from_orm_pqrs(pqrs)

async def actualizar_pqrs(
    pqrs_id: uuid.UUID,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    data: PQRSUpdate,
    db: AsyncSession,
  ) -> PQRSResponse:
  pqrs = await repo.get_pqrs_by_id(db, pqrs_id, tenant_id)
  if not pqrs:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRS no encontrada")
  cambios = data.model_dump(exclude_none=True)
  # Validar transición de estado
  if "estado" in cambios:
    nuevo_estado = cambios["estado"]
    permitidos = _TRANSICIONES.get(pqrs.estado, [])
    if nuevo_estado not in permitidos:
      raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"Transición inválida: '{pqrs.estado}' → '{nuevo_estado}'"
      )
    now = datetime.now()
    # Primera respuesta: cuando pasa de ABIERTA a EN_PROCESO
    if (
      pqrs.estado == EstadoPQRS.ABIERTA
      and nuevo_estado == EstadoPQRS.EN_PROCESO
      and not pqrs.fecha_primera_respuesta
    ):
      cambios["fecha_primera_respuesta"] = now
    # Fecha resolución al cerrar o resolver
    if nuevo_estado in (EstadoPQRS.RESUELTA, EstadoPQRS.RECHAZADA):
      cambios["fecha_resolucion"] = now
    # Nota interna automática del cambio de estado
    await repo.create_mensaje(
      db, pqrs_id, usuario_id,
      contenido=f"Estado actualizado a '{_LABEL_ESTADO.get(nuevo_estado, nuevo_estado.value)}'.",
      is_interno=True,
    )
  pqrs = await repo.update_pqrs(db, pqrs, cambios)
  pqrs = await repo.get_pqrs_by_id(db, pqrs_id, tenant_id)
  return PQRSResponse.from_orm_pqrs(pqrs)

# ======================================
#           MENSAJE PQRS
# ======================================

async def agregar_mensaje(
    pqrs_id: uuid.UUID,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    rol_usuario: TipoRol,
    data: MensajePQRSCreate,
    db: AsyncSession,
  ) -> MensajePQRSResponse:
  pqrs = await repo.get_pqrs_by_id(db, pqrs_id, tenant_id)
  if not pqrs:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRS no encontrada")
  if pqrs.estado in _ESTADOS_FINALES:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"No se pueden agregar mensajes a una PQRS en estado '{pqrs.estado}'"
    )
  # Solo administración puede enviar mensajes internos
  es_admin = rol_usuario in (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
  if data.is_interno and not es_admin:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Solo la administración puede enviar notas internas"
    )
  mensaje = await repo.create_mensaje(
    db, pqrs_id, usuario_id, data.contenido, data.is_interno
  )
  return MensajePQRSResponse.model_validate(mensaje)
