import uuid
from datetime import datetime, timezone, date
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.visitors import repository as repo
from app.modules.visitors.models import EstadoAutorizacion
from app.modules.visitors.schemas import (
    AutorizacionCreate, AutorizacionUpdate, AutorizacionResponse,
    IngresoCreate, IngresoResponse,
  )

async def listar_autorizaciones(
    tenant_id: uuid.UUID,
    fecha: date | None,
    db: AsyncSession
  ) -> list[AutorizacionResponse]:
  items = await repo.get_autorizaciones_by_tenant(db, tenant_id, fecha)
  return [AutorizacionResponse.model_validate(a) for a in items]

async def obtener_autorizacion(
    autorizacion_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> AutorizacionResponse:
  autorizacion = await repo.get_autorizacion_by_id(db, autorizacion_id, tenant_id)
  if not autorizacion:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Autorización no encontrada")
  return AutorizacionResponse.model_validate(autorizacion)

async def crear_autorizacion(
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    data: AutorizacionCreate,
    db: AsyncSession
  ) -> AutorizacionResponse:
  # Reusar visitante si ya existe por documento, o crearlo
  visitante = await repo.get_visitante_by_documento(db, data.visitante.n_documento)
  if not visitante:
    visitante = await repo.create_visitante(db, data.visitante.model_dump())
  autorizacion = await repo.create_autorizacion(db, {
    "tenant_id": tenant_id,
    "unidad_id": data.unidad_id,
    "visitante_id": visitante.id,
    "autorizado_por": usuario_id,
    "fecha_visita": data.fecha_visita,
    "requiere_parqueadero": data.requiere_parqueadero,
    "estado": EstadoAutorizacion.ACTIVA,
  })
  for v in data.vehiculos:
    await repo.create_vehiculo(db, tenant_id, autorizacion.id, v.model_dump())
  # Recargar con relaciones para la respuesta
  autorizacion = await repo.get_autorizacion_by_id(db, autorizacion.id, tenant_id)
  return AutorizacionResponse.model_validate(autorizacion)

async def actualizar_autorizacion(
    autorizacion_id: uuid.UUID,
    tenant_id: uuid.UUID,
    data: AutorizacionUpdate,
    db: AsyncSession
  ) -> AutorizacionResponse:
  autorizacion = await repo.get_autorizacion_by_id(db, autorizacion_id, tenant_id)
  if not autorizacion:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Autorización no encontrada")
  autorizacion = await repo.update_autorizacion(
    db, autorizacion, data.model_dump(exclude_none=True)
  )
  return AutorizacionResponse.model_validate(autorizacion)

async def cancelar_autorizacion(
    autorizacion_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> None:
  autorizacion = await repo.get_autorizacion_by_id(db, autorizacion_id, tenant_id)
  if not autorizacion:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Autorización no encontrada")
  if autorizacion.estado not in [EstadoAutorizacion.ACTIVA, EstadoAutorizacion.PENDIENTE]:
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"No se puede cancelar una autorización en estado '{autorizacion.estado}'"
    )
  await repo.update_autorizacion(db, autorizacion, {"estado": EstadoAutorizacion.CANCELADA})

async def registrar_ingreso(
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    data: IngresoCreate,
    db: AsyncSession
  ) -> IngresoResponse:
  hoy = datetime.now(timezone.utc).date()
  
  # Buscar visitante
  visitante = await repo.get_visitante_by_documento(db, data.visitante_documento)
  if not visitante:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Visitante no encontrado. Debe tener una autorización previa o ser registrado primero."
    )
  autorizacion_id = data.autorizacion_id
  # Si no viene autorizacion_id, buscar una activa para hoy
  if not autorizacion_id:
    autorizacion = await repo.get_autorizacion_activa_por_documento(
      db, tenant_id, data.visitante_documento, hoy
    )
    if autorizacion:
      autorizacion_id = autorizacion.id
      # Marcar como utilizada
      await repo.update_autorizacion(
        db, autorizacion, {"estado": EstadoAutorizacion.UTILIZADA}
      )  
  ingreso = await repo.create_ingreso(db, {
    "tenant_id": tenant_id,
    "visitante_id": visitante.id,
    "autorizacion_id": autorizacion_id,
    "registrado_por": usuario_id,
    "fecha_hora_ingreso": datetime.now(timezone.utc),
  })  
  # Recargar con relaciones
  from sqlalchemy import select
  from sqlalchemy.orm import selectinload
  from app.modules.visitors.models import IngresoVisita
  result = await db.execute(
    select(IngresoVisita)
    .where(IngresoVisita.id == ingreso.id)
    .options(selectinload(IngresoVisita.visitante))
  )
  ingreso = result.scalar_one()
  return IngresoResponse.model_validate(ingreso)

async def listar_ingresos(
    tenant_id: uuid.UUID,
    fecha: date | None,
    db: AsyncSession
  ) -> list[IngresoResponse]:
  items = await repo.get_ingresos_by_tenant(db, tenant_id, fecha)
  return [IngresoResponse.model_validate(i) for i in items]
