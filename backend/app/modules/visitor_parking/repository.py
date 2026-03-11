import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.visitor_parking.models import ParqueaderoVisitante

async def get_parqueadero_visitante_activo(
    db: AsyncSession, tenant_id: uuid.UUID, numero: str
  ) -> ParqueaderoVisitante | None:
  result = await db.execute(
    select(ParqueaderoVisitante).where(
      ParqueaderoVisitante.tenant_id == tenant_id,
      ParqueaderoVisitante.numero == numero,
      ParqueaderoVisitante.fecha_hora_liberacion == None,
    )
  )
  return result.scalar_one_or_none()

async def get_parqueaderos_activos(
    db: AsyncSession, tenant_id: uuid.UUID
  ) -> list[ParqueaderoVisitante]:
  result = await db.execute(
    select(ParqueaderoVisitante).where(
      ParqueaderoVisitante.tenant_id == tenant_id,
      ParqueaderoVisitante.fecha_hora_liberacion == None,
    ).order_by(ParqueaderoVisitante.fecha_hora_asignacion.desc())
  )
  return list(result.scalars().all())

async def create_parqueadero_visitante(
    db: AsyncSession, data: dict
  ) -> ParqueaderoVisitante:
  pv = ParqueaderoVisitante(**data)
  db.add(pv)
  await db.flush()
  await db.refresh(pv)
  return pv

async def liberar_parqueadero_visitante(
    db: AsyncSession, pv: ParqueaderoVisitante
  ) -> ParqueaderoVisitante:
  pv.fecha_hora_liberacion = datetime.utcnow()
  pv.updated_at = datetime.utcnow()
  await db.flush()
  await db.refresh(pv)
  return pv