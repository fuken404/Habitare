import uuid
from datetime import datetime, date, time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.modules.common_areas.models import (
    ZonaComun, HorarioZonaComun, ReservaZonaComun,
    DiaSemana, EstadoReserva
  )

# ======================================
#          ZONA COMÚN
# ======================================

async def get_zonas(
    db: AsyncSession, tenant_id: uuid.UUID, solo_activas: bool = True
  ) -> list[ZonaComun]:
  query = (
    select(ZonaComun)
    .where(ZonaComun.tenant_id == tenant_id)
    .options(selectinload(ZonaComun.horarios))
    .order_by(ZonaComun.nombre)
  )
  if solo_activas:
    query = query.where(ZonaComun.is_activa == True)
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_zona_by_id(
    db: AsyncSession, zona_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> ZonaComun | None:
  result = await db.execute(
    select(ZonaComun)
    .where(ZonaComun.id == zona_id, ZonaComun.tenant_id == tenant_id)
    .options(selectinload(ZonaComun.horarios))
  )
  return result.scalar_one_or_none()

async def create_zona(db: AsyncSession, data: dict) -> ZonaComun:
  zona = ZonaComun(**data)
  db.add(zona)
  await db.flush()
  await db.refresh(zona)
  return zona

async def update_zona(
    db: AsyncSession, zona: ZonaComun, data: dict
  ) -> ZonaComun:
  for key, value in data.items():
    setattr(zona, key, value)
  zona.updated_at = datetime.utcnow()
  await db.flush()
  await db.refresh(zona)
  return zona

async def delete_zona(db: AsyncSession, zona: ZonaComun) -> None:
  await db.delete(zona)
  await db.flush()

# ======================================
#          HORARIO ZONA COMÚN
# ======================================

async def get_horario_by_id(
    db: AsyncSession, horario_id: uuid.UUID
  ) -> HorarioZonaComun | None:
  result = await db.execute(
    select(HorarioZonaComun).where(HorarioZonaComun.id == horario_id)
  )
  return result.scalar_one_or_none()

async def create_horario(
    db: AsyncSession, zona_id: uuid.UUID, data: dict
  ) -> HorarioZonaComun:
  horario = HorarioZonaComun(zona_comun_id=zona_id, **data)
  db.add(horario)
  await db.flush()
  await db.refresh(horario)
  return horario

async def delete_horario(db: AsyncSession, horario: HorarioZonaComun) -> None:
  await db.delete(horario)
  await db.flush()

# ======================================
#          RESERVA ZONA COMÚN
# ======================================

async def get_reservas(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    zona_id: uuid.UUID | None = None,
    estado: EstadoReserva | None = None,
    fecha: date | None = None,
  ) -> list[ReservaZonaComun]:
  query = (
    select(ReservaZonaComun)
    .where(ReservaZonaComun.tenant_id == tenant_id)
    .order_by(ReservaZonaComun.fecha_reserva.desc(), ReservaZonaComun.hora_inicio)
  )
  if zona_id:
    query = query.where(ReservaZonaComun.zona_comun_id == zona_id)
  if estado:
    query = query.where(ReservaZonaComun.estado == estado)
  if fecha:
    query = query.where(ReservaZonaComun.fecha_reserva == fecha)
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_reserva_by_id(
    db: AsyncSession, reserva_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> ReservaZonaComun | None:
  result = await db.execute(
    select(ReservaZonaComun).where(
      ReservaZonaComun.id == reserva_id,
      ReservaZonaComun.tenant_id == tenant_id,
    )
  )
  return result.scalar_one_or_none()

async def get_reservas_solapadas(
    db: AsyncSession,
    zona_id: uuid.UUID,
    fecha: date,
    hora_inicio: time,
    hora_fin: time,
    excluir_id: uuid.UUID | None = None,
  ) -> list[ReservaZonaComun]:
  """
  Retorna reservas activas (PENDIENTE o CONFIRMADA) que se solapen
  con el rango hora_inicio–hora_fin en la misma fecha y zona.
  Solapamiento: inicio_A < fin_B AND fin_A > inicio_B
  """
  query = select(ReservaZonaComun).where(
    and_(
      ReservaZonaComun.zona_comun_id == zona_id,
      ReservaZonaComun.fecha_reserva == fecha,
      ReservaZonaComun.estado.in_([EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA]),
      ReservaZonaComun.hora_inicio < hora_fin,
      ReservaZonaComun.hora_fin > hora_inicio,
    )
  )
  if excluir_id:
    query = query.where(ReservaZonaComun.id != excluir_id)
  result = await db.execute(query)
  return list(result.scalars().all())

async def create_reserva(db: AsyncSession, data: dict) -> ReservaZonaComun:
  reserva = ReservaZonaComun(**data)
  db.add(reserva)
  await db.flush()
  await db.refresh(reserva)
  return reserva

async def update_reserva(
    db: AsyncSession, reserva: ReservaZonaComun, data: dict
  ) -> ReservaZonaComun:
  for key, value in data.items():
    setattr(reserva, key, value)
  reserva.updated_at = datetime.utcnow()
  await db.flush()
  await db.refresh(reserva)
  return reserva
