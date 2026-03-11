import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.external_personnel.models import IngresoExterno

async def get_ingresos(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    activos: bool | None = None,
    tipo_personal: str | None = None,
    desde: datetime | None = None,
    hasta: datetime | None = None,
  ) -> list[IngresoExterno]:
  query = (
    select(IngresoExterno)
    .where(IngresoExterno.tenant_id == tenant_id)
    .order_by(IngresoExterno.fecha_hora_ingreso.desc())
  )
  if activos is True:
    query = query.where(IngresoExterno.fecha_hora_salida.is_(None))
  elif activos is False:
    query = query.where(IngresoExterno.fecha_hora_salida.is_not(None))
  if tipo_personal:
    query = query.where(IngresoExterno.tipo_personal == tipo_personal)
  if desde:
    query = query.where(IngresoExterno.fecha_hora_ingreso >= desde)
  if hasta:
    query = query.where(IngresoExterno.fecha_hora_ingreso <= hasta)
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_ingreso_by_id(
    db: AsyncSession, ingreso_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> IngresoExterno | None:
  result = await db.execute(
    select(IngresoExterno).where(
      IngresoExterno.id == ingreso_id,
      IngresoExterno.tenant_id == tenant_id,
    )
  )
  return result.scalar_one_or_none()

async def create_ingreso(db: AsyncSession, data: dict) -> IngresoExterno:
  ingreso = IngresoExterno(**data)
  db.add(ingreso)
  await db.flush()
  await db.refresh(ingreso)
  return ingreso

async def update_ingreso(
    db: AsyncSession, ingreso: IngresoExterno, data: dict
  ) -> IngresoExterno:
    for key, value in data.items():
      setattr(ingreso, key, value)
    ingreso.updated_at = datetime.utcnow()
    await db.flush()
    await db.refresh(ingreso)
    return ingreso
