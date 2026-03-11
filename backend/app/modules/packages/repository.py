import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.packages.models import Paquete, EstadoPaquete

async def get_paquete_by_id(
    db: AsyncSession, paquete_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> Paquete | None:
  result = await db.execute(
    select(Paquete).where(
      Paquete.id == paquete_id,
      Paquete.tenant_id == tenant_id
    )
  )
  return result.scalar_one_or_none()

async def get_paquetes_by_tenant(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    estado: EstadoPaquete | None = None,
    unidad_id: uuid.UUID | None = None,
  ) -> list[Paquete]:
  query = (
    select(Paquete)
    .where(Paquete.tenant_id == tenant_id)
    .order_by(Paquete.fecha_recepcion.desc())
  )
  if estado:
    query = query.where(Paquete.estado == estado)
  if unidad_id:
    query = query.where(Paquete.unidad_id == unidad_id)
  
  result = await db.execute(query)
  return list(result.scalars().all())

async def create_paquete(db: AsyncSession, data: dict) -> Paquete:
  paquete = Paquete(**data)
  db.add(paquete)
  await db.flush()
  await db.refresh(paquete)
  return paquete


async def update_paquete(db: AsyncSession, paquete: Paquete, data: dict) -> Paquete:
  for key, value in data.items():
    setattr(paquete, key, value)
  paquete.updated_at = datetime.utcnow()
  await db.flush()
  await db.refresh(paquete)
  return paquete
