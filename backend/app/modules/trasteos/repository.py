import uuid
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.modules.trasteos.models import Trasteo, EstadoTrasteo
from app.modules.tenants.models import Unidad


async def get_trasteos(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    fecha: date | None = None,
    estado: EstadoTrasteo | None = None,
) -> list[Trasteo]:
  query = (
    select(Trasteo)
    .where(Trasteo.tenant_id == tenant_id)
    .options(
      selectinload(Trasteo.unidad).selectinload(Unidad.torre),
      selectinload(Trasteo.creador),
    )
    .order_by(Trasteo.fecha_programada.desc(), Trasteo.hora_inicio)
  )
  if fecha:
    query = query.where(Trasteo.fecha_programada == fecha)
  if estado:
    query = query.where(Trasteo.estado == estado)
  result = await db.execute(query)
  return list(result.scalars().all())


async def get_trasteo_by_id(
    db: AsyncSession, trasteo_id: uuid.UUID, tenant_id: uuid.UUID
) -> Trasteo | None:
  result = await db.execute(
    select(Trasteo)
    .where(Trasteo.id == trasteo_id, Trasteo.tenant_id == tenant_id)
    .options(
      selectinload(Trasteo.unidad).selectinload(Unidad.torre),
      selectinload(Trasteo.creador),
    )
  )
  return result.scalar_one_or_none()


async def create_trasteo(db: AsyncSession, data: dict) -> Trasteo:
  trasteo = Trasteo(**data)
  db.add(trasteo)
  await db.flush()
  # reload with relationships
  result = await db.execute(
    select(Trasteo)
    .where(Trasteo.id == trasteo.id)
    .options(
      selectinload(Trasteo.unidad).selectinload(Unidad.torre),
      selectinload(Trasteo.creador),
    )
  )
  return result.scalar_one()


async def update_trasteo(db: AsyncSession, trasteo: Trasteo, data: dict) -> Trasteo:
  for key, value in data.items():
    setattr(trasteo, key, value)
  trasteo.updated_at = datetime.now()
  await db.flush()
  await db.refresh(trasteo)
  return trasteo
