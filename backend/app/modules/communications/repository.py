import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.modules.communications.models import (
    Comunicado, SegmentacionComunicado, EstadoComunicado
  )

# ======================================
#          COMUNICADO
# ======================================

async def get_comunicados(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    estado: EstadoComunicado | None = None,
  ) -> list[Comunicado]:
  query = (
    select(Comunicado)
    .where(Comunicado.tenant_id == tenant_id)
    .order_by(Comunicado.created_at.desc())
  )
  if estado:
    query = query.where(Comunicado.estado == estado)
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_comunicado_by_id(
    db: AsyncSession, comunicado_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> Comunicado | None:
  result = await db.execute(
    select(Comunicado)
    .where(Comunicado.id == comunicado_id, Comunicado.tenant_id == tenant_id)
    .options(selectinload(Comunicado.segmentaciones))
  )
  return result.scalar_one_or_none()

async def create_comunicado(db: AsyncSession, data: dict) -> Comunicado:
  comunicado = Comunicado(**data)
  db.add(comunicado)
  await db.flush()
  await db.refresh(comunicado)
  return comunicado

async def update_comunicado(
    db: AsyncSession, comunicado: Comunicado, data: dict
  ) -> Comunicado:
  for key, value in data.items():
    setattr(comunicado, key, value)
  comunicado.updated_at = datetime.now(timezone.utc)
  await db.flush()
  await db.refresh(comunicado)
  return comunicado

async def delete_comunicado(db: AsyncSession, comunicado: Comunicado) -> None:
  await db.delete(comunicado)
  await db.flush()

# ======================================
#          SEGMENTACIÓN
# ======================================

async def create_segmentacion(
    db: AsyncSession, comunicado_id: uuid.UUID, data: dict
  ) -> SegmentacionComunicado:
  seg = SegmentacionComunicado(comunicado_id=comunicado_id, **data)
  db.add(seg)
  await db.flush()
  await db.refresh(seg)
  return seg

async def delete_segmentaciones(
    db: AsyncSession, comunicado_id: uuid.UUID
  ) -> None:
  """Elimina todas las segmentaciones de un comunicado (para reemplazarlas)."""
  result = await db.execute(
    select(SegmentacionComunicado).where(
      SegmentacionComunicado.comunicado_id == comunicado_id
    )
  )
  for seg in result.scalars().all():
    await db.delete(seg)
  await db.flush()