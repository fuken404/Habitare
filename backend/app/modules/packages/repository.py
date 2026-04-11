import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.modules.packages.models import Paquete, EstadoPaquete
from app.modules.tenants.models import Unidad, Torre

def _with_unidad():
  return selectinload(Paquete.unidad).selectinload(Unidad.torre)

async def get_paquete_by_id(
    db: AsyncSession, paquete_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> Paquete | None:
  result = await db.execute(
    select(Paquete)
    .options(_with_unidad())
    .where(Paquete.id == paquete_id, Paquete.tenant_id == tenant_id)
  )
  return result.scalar_one_or_none()

async def get_paquetes_by_tenant(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    estado: EstadoPaquete | None = None,
    unidad_id: uuid.UUID | None = None,
    solo_semana: bool = False,
  ) -> list[Paquete]:
  query = (
    select(Paquete)
    .options(_with_unidad())
    .where(Paquete.tenant_id == tenant_id)
    .order_by(Paquete.fecha_recepcion.desc())
  )
  if estado:
    query = query.where(Paquete.estado == estado)
  if unidad_id:
    query = query.where(Paquete.unidad_id == unidad_id)
  if solo_semana:
    desde = datetime.now() - timedelta(days=7)
    query = query.where(Paquete.fecha_entrega >= desde)

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
  paquete.updated_at = datetime.now()
  await db.flush()
  await db.refresh(paquete)
  return paquete
