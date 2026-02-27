import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.modules.shifts.models import Turno

async def get_turnos(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID | None = None,
    desde: datetime | None = None,
    hasta: datetime | None = None,
  ) -> list[Turno]:
  query = (
    select(Turno)
    .where(Turno.tenant_id == tenant_id)
    .order_by(Turno.fecha_inicio.desc())
  )
  if usuario_id:
    query = query.where(Turno.usuario_id == usuario_id)
  if desde:
    query = query.where(Turno.fecha_inicio >= desde)
  if hasta:
    query = query.where(Turno.fecha_fin <= hasta)
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_turno_by_id(
    db: AsyncSession, turno_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> Turno | None:
  result = await db.execute(
    select(Turno).where(Turno.id == turno_id, Turno.tenant_id == tenant_id)
  )
  return result.scalar_one_or_none()

async def get_turnos_solapados(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    usuario_id: uuid.UUID,
    fecha_inicio: datetime,
    fecha_fin: datetime,
    excluir_id: uuid.UUID | None = None,
  ) -> list[Turno]:
  """
  Solapamiento: inicio_A < fin_B AND fin_A > inicio_B
  """
  query = select(Turno).where(
    and_(
      Turno.tenant_id == tenant_id,
      Turno.usuario_id == usuario_id,
      Turno.fecha_inicio < fecha_fin,
      Turno.fecha_fin > fecha_inicio,
    )
  )
  if excluir_id:
    query = query.where(Turno.id != excluir_id)
  result = await db.execute(query)
  return list(result.scalars().all())

async def create_turno(db: AsyncSession, data: dict) -> Turno:
  turno = Turno(**data)
  db.add(turno)
  await db.flush()
  await db.refresh(turno)
  return turno

async def update_turno(
    db: AsyncSession, turno: Turno, data: dict
  ) -> Turno:
  for key, value in data.items():
    setattr(turno, key, value)
  turno.updated_at = datetime.now(timezone.utc)
  await db.flush()
  await db.refresh(turno)
  return turno

async def delete_turno(db: AsyncSession, turno: Turno) -> None:
  await db.delete(turno)
  await db.flush()
