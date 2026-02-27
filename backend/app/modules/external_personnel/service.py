import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.external_personnel import repository as repo
from app.modules.external_personnel.models import TipoPersonalExterno
from app.modules.external_personnel.schemas import (
    IngresoExternoCreate, IngresoExternoUpdate, SalidaExternoRequest,
    IngresoExternoResponse, IngresoExternoListResponse,
  )

async def listar_ingresos(
    tenant_id: uuid.UUID,
    activos: bool | None,
    tipo_personal: TipoPersonalExterno | None,
    desde: datetime | None,
    hasta: datetime | None,
    db: AsyncSession,
  ) -> list[IngresoExternoListResponse]:
  items = await repo.get_ingresos(db, tenant_id, activos, tipo_personal, desde, hasta)
  return [IngresoExternoListResponse.model_validate(i) for i in items]

async def obtener_ingreso(
    ingreso_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession
  ) -> IngresoExternoResponse:
  ingreso = await repo.get_ingreso_by_id(db, ingreso_id, tenant_id)
  if not ingreso:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingreso no encontrado")
  return IngresoExternoResponse.model_validate(ingreso)

async def registrar_ingreso(
    tenant_id: uuid.UUID,
    registrado_por: uuid.UUID,
    data: IngresoExternoCreate,
    db: AsyncSession,
  ) -> IngresoExternoResponse:
  ingreso = await repo.create_ingreso(db, {
    "tenant_id": tenant_id,
    "registrado_por": registrado_por,
    **data.model_dump(),
  })
  return IngresoExternoResponse.model_validate(ingreso)


async def registrar_salida(
    ingreso_id: uuid.UUID,
    tenant_id: uuid.UUID,
    data: SalidaExternoRequest,
    db: AsyncSession,
  ) -> IngresoExternoResponse:
  ingreso = await repo.get_ingreso_by_id(db, ingreso_id, tenant_id)
  if not ingreso:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingreso no encontrado")
  if ingreso.fecha_hora_salida is not None:
      raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="La salida ya fue registrada para este ingreso"
      )
  if data.fecha_hora_salida <= ingreso.fecha_hora_ingreso:
    raise HTTPException(
      status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
      detail="fecha_hora_salida debe ser posterior a fecha_hora_ingreso"
    )
  ingreso = await repo.update_ingreso(db, ingreso, {
    "fecha_hora_salida": data.fecha_hora_salida,
  })
  return IngresoExternoResponse.model_validate(ingreso)

async def actualizar_ingreso(
    ingreso_id: uuid.UUID,
    tenant_id: uuid.UUID,
    data: IngresoExternoUpdate,
    db: AsyncSession,
  ) -> IngresoExternoResponse:
  ingreso = await repo.get_ingreso_by_id(db, ingreso_id, tenant_id)
  if not ingreso:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingreso no encontrado")
  ingreso = await repo.update_ingreso(db, ingreso, data.model_dump(exclude_none=True))
  return IngresoExternoResponse.model_validate(ingreso)
