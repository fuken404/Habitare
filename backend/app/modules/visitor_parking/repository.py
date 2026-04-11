import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.modules.visitor_parking.models import LugarParqueaderoVisitante, ParqueaderoVisitante


# ──────────────────────────────────────────────
#   LUGARES (slots físicos)
# ──────────────────────────────────────────────

async def get_lugares_by_tenant(
    db: AsyncSession, tenant_id: uuid.UUID
  ) -> list[LugarParqueaderoVisitante]:
  result = await db.execute(
    select(LugarParqueaderoVisitante)
    .where(LugarParqueaderoVisitante.tenant_id == tenant_id)
    .order_by(LugarParqueaderoVisitante.numero.asc())
  )
  return list(result.scalars().all())


async def get_lugar_by_id(
    db: AsyncSession, tenant_id: uuid.UUID, lugar_id: uuid.UUID
  ) -> LugarParqueaderoVisitante | None:
  result = await db.execute(
    select(LugarParqueaderoVisitante).where(
      LugarParqueaderoVisitante.id == lugar_id,
      LugarParqueaderoVisitante.tenant_id == tenant_id,
    )
  )
  return result.scalar_one_or_none()


async def get_lugar_disponible(
    db: AsyncSession, tenant_id: uuid.UUID, tipo_vehiculo: str = "carro"
  ) -> LugarParqueaderoVisitante | None:
  """
  Retorna el primer lugar activo compatible con el tipo de vehículo que no esté
  actualmente ocupado (sin asignación activa).
  Un lugar 'mixto' acepta cualquier tipo de vehículo.
  """
  # IDs de lugares actualmente ocupados
  ocupados_result = await db.execute(
    select(ParqueaderoVisitante.lugar_id).where(
      ParqueaderoVisitante.tenant_id == tenant_id,
      ParqueaderoVisitante.lugar_id.isnot(None),
      ParqueaderoVisitante.fecha_hora_liberacion.is_(None),
    )
  )
  ocupados_ids = set(ocupados_result.scalars().all())

  tipos_compatibles = [tipo_vehiculo, "mixto"]
  result = await db.execute(
    select(LugarParqueaderoVisitante)
    .where(
      LugarParqueaderoVisitante.tenant_id == tenant_id,
      LugarParqueaderoVisitante.is_activo.is_(True),
      LugarParqueaderoVisitante.tipo.in_(tipos_compatibles),
    )
    .order_by(LugarParqueaderoVisitante.numero.asc())
  )
  for lugar in result.scalars().all():
    if lugar.id not in ocupados_ids:
      return lugar
  return None


async def create_lugar(
    db: AsyncSession, data: dict
  ) -> LugarParqueaderoVisitante:
  lugar = LugarParqueaderoVisitante(**data)
  db.add(lugar)
  await db.flush()
  await db.refresh(lugar)
  return lugar


async def deactivate_lugar(
    db: AsyncSession, lugar: LugarParqueaderoVisitante
  ) -> LugarParqueaderoVisitante:
  lugar.is_activo = False
  lugar.updated_at = datetime.now()
  await db.flush()
  await db.refresh(lugar)
  return lugar


# ──────────────────────────────────────────────
#   ASIGNACIONES
# ──────────────────────────────────────────────

async def get_parqueadero_visitante_activo(
    db: AsyncSession, tenant_id: uuid.UUID, lugar_id: uuid.UUID
  ) -> ParqueaderoVisitante | None:
  result = await db.execute(
    select(ParqueaderoVisitante).where(
      ParqueaderoVisitante.tenant_id == tenant_id,
      ParqueaderoVisitante.lugar_id == lugar_id,
      ParqueaderoVisitante.fecha_hora_liberacion.is_(None),
    )
  )
  return result.scalar_one_or_none()


async def get_parqueaderos_activos(
    db: AsyncSession, tenant_id: uuid.UUID
  ) -> list[ParqueaderoVisitante]:
  from app.modules.visitors.models import IngresoVisita
  result = await db.execute(
    select(ParqueaderoVisitante)
    .where(
      ParqueaderoVisitante.tenant_id == tenant_id,
      ParqueaderoVisitante.fecha_hora_liberacion.is_(None),
    )
    .options(
      selectinload(ParqueaderoVisitante.lugar),
      selectinload(ParqueaderoVisitante.ingreso_visita)
      .selectinload(IngresoVisita.visitante),
    )
    .order_by(ParqueaderoVisitante.fecha_hora_asignacion.asc())
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
  pv.fecha_hora_liberacion = datetime.now()
  pv.updated_at = datetime.now()
  await db.flush()
  await db.refresh(pv)
  return pv
