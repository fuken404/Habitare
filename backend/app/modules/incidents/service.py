import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.incidents import repository as repo
from app.modules.incidents.models import EstadoIncidente
from app.modules.incidents.schemas import (
    TipoIncidenteCreate, TipoIncidenteUpdate, TipoIncidenteResponse,
    IncidenteCreate, IncidenteUpdate, IncidenteResponse, IncidenteListResponse,
    ActualizacionCreate, ActualizacionResponse,
  )

# Transiciones de estado válidas
_TRANSICIONES: dict[EstadoIncidente, list[EstadoIncidente]] = {
    EstadoIncidente.REPORTADO:   [EstadoIncidente.EN_ATENCION, EstadoIncidente.CERRADO],
    EstadoIncidente.EN_ATENCION: [EstadoIncidente.RESUELTO, EstadoIncidente.CERRADO],
    EstadoIncidente.RESUELTO:    [EstadoIncidente.CERRADO],
    EstadoIncidente.CERRADO:     [],
  }

# ======================================
#          TIPO DE INCIDENTE
# ======================================

async def listar_tipos(tenant_id: uuid.UUID, db: AsyncSession) -> list[TipoIncidenteResponse]:
  items = await repo.get_tipos(db, tenant_id)
  return [TipoIncidenteResponse.model_validate(t) for t in items]

async def crear_tipo(
    tenant_id: uuid.UUID, data: TipoIncidenteCreate, db: AsyncSession
  ) -> TipoIncidenteResponse:
  tipo = await repo.create_tipo(db, {"tenant_id": tenant_id, **data.model_dump()})
  return TipoIncidenteResponse.model_validate(tipo)

async def actualizar_tipo(
    tipo_id: uuid.UUID, tenant_id: uuid.UUID,
    data: TipoIncidenteUpdate, db: AsyncSession
  ) -> TipoIncidenteResponse:
  tipo = await repo.get_tipo_by_id(db, tipo_id, tenant_id)
  if not tipo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tipo de incidente no encontrado")
  tipo = await repo.update_tipo(db, tipo, data.model_dump(exclude_none=True))
  return TipoIncidenteResponse.model_validate(tipo)

async def eliminar_tipo(
    tipo_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> None:
  tipo = await repo.get_tipo_by_id(db, tipo_id, tenant_id)
  if not tipo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tipo de incidente no encontrado")
  if tipo.incidentes:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="No se puede eliminar: existen incidentes asociados a este tipo"
    )
  await repo.delete_tipo(db, tipo)

# ======================================
#             INCIDENTE
# ======================================

async def listar_incidentes(
    tenant_id: uuid.UUID,
    estado: EstadoIncidente | None,
    unidad_id: uuid.UUID | None,
    db: AsyncSession,
    excluir_cerrados: bool = False,
  ) -> list[IncidenteListResponse]:
  items = await repo.get_incidentes(db, tenant_id, estado, unidad_id, excluir_cerrados)
  return [IncidenteListResponse.from_orm_incidente(i) for i in items]

async def obtener_incidente(
    incidente_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> IncidenteResponse:
  incidente = await repo.get_incidente_by_id(db, incidente_id, tenant_id)
  if not incidente:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incidente no encontrado")
  return IncidenteResponse.model_validate(incidente)

async def crear_incidente(
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    data: IncidenteCreate,
    db: AsyncSession,
  ) -> IncidenteResponse:
  # Validar que el tipo exista y pertenezca al tenant
  tipo = await repo.get_tipo_by_id(db, data.tipo_id, tenant_id)
  if not tipo:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tipo de incidente no encontrado")

  year = datetime.now().year
  count = await repo.count_incidentes_by_year(db, tenant_id, year)
  numero_radicado = f"NOV-{year}-{count + 1:03d}"

  incidente = await repo.create_incidente(db, {
    "tenant_id": tenant_id,
    "reportado_por": usuario_id,
    "estado": EstadoIncidente.REPORTADO,
    "numero_radicado": numero_radicado,
    **data.model_dump(),
  })
  
  # Registrar la primera actualización automática
  await repo.create_actualizacion(
    db, incidente.id, usuario_id,
    descripcion="Incidente reportado."
  )

  # Notificar a todos los usuarios de seguridad del tenant
  try:
    from app.modules.users.repository import get_usuario_ids_by_rol
    from app.modules.users.models import TipoRol
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
          mensaje=f"{incidente.titulo}",
          tipo=TipoNotificacion.ALERTA,
          canal=CanalNotificacion.PUSH,
          entidad_tipo="incidente",
          entidad_id=incidente.id,
        ),
        db,
      )
  except Exception:
    pass  # Las notificaciones son best-effort

  incidente = await repo.get_incidente_by_id(db, incidente.id, tenant_id)
  return IncidenteResponse.model_validate(incidente)

async def actualizar_incidente(
    incidente_id: uuid.UUID,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    data: IncidenteUpdate,
    db: AsyncSession,
  ) -> IncidenteResponse:
  incidente = await repo.get_incidente_by_id(db, incidente_id, tenant_id)
  if not incidente:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incidente no encontrado")
  
  cambios = data.model_dump(exclude_none=True)
  
  # Validar transición de estado si se está cambiando
  if "estado" in cambios:
    nuevo_estado = cambios["estado"]
    permitidos = _TRANSICIONES.get(incidente.estado, [])
    if nuevo_estado not in permitidos:
      raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"Transición inválida: '{incidente.estado}' → '{nuevo_estado}'"
      )
    # Si pasa a RESUELTO, registrar fecha de resolución
    if nuevo_estado == EstadoIncidente.RESUELTO:
      cambios["fecha_resolucion"] = datetime.now()
  incidente = await repo.update_incidente(db, incidente, cambios)
  # Bitácora automática del cambio de estado
  if "estado" in cambios:
    await repo.create_actualizacion(
      db, incidente.id, usuario_id,
      descripcion=f"Estado actualizado a '{cambios['estado']}'."
    )  
  incidente = await repo.get_incidente_by_id(db, incidente.id, tenant_id)
  return IncidenteResponse.model_validate(incidente)

# ======================================
#        ACTUALIZACIÓN DE INCIDENTE
# ======================================

async def agregar_actualizacion(
    incidente_id: uuid.UUID,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    data: ActualizacionCreate,
    db: AsyncSession,
  ) -> ActualizacionResponse:
  incidente = await repo.get_incidente_by_id(db, incidente_id, tenant_id)
  if not incidente:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incidente no encontrado")
  if incidente.estado == EstadoIncidente.CERRADO:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="No se pueden agregar actualizaciones a un incidente CERRADO"
    )
  actualizacion = await repo.create_actualizacion(
    db, incidente_id, usuario_id, data.descripcion
  )
  return ActualizacionResponse.model_validate(actualizacion)
