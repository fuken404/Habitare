import uuid
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.modules.appointments.models import DisponibilidadAdmin, CitaAdmin, EstadoCita
from app.modules.tenants.models import Unidad


async def get_disponibilidades(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    fecha: date | None = None,
    solo_futuras: bool = False,
) -> list[tuple[DisponibilidadAdmin, int]]:
  query = (
    select(DisponibilidadAdmin)
    .where(DisponibilidadAdmin.tenant_id == tenant_id)
    .options(selectinload(DisponibilidadAdmin.citas))
    .order_by(DisponibilidadAdmin.fecha, DisponibilidadAdmin.hora_inicio)
  )
  if fecha:
    query = query.where(DisponibilidadAdmin.fecha == fecha)
  if solo_futuras:
    from datetime import date as d
    query = query.where(DisponibilidadAdmin.fecha >= d.today())
  result = await db.execute(query)
  rows = list(result.scalars().all())
  # Compute cupos_disponibles per slot
  ocupados_por_slot: dict[uuid.UUID, int] = {}
  for slot in rows:
    ocupados_por_slot[slot.id] = sum(
      1 for c in slot.citas if c.estado in (EstadoCita.SOLICITADA, EstadoCita.CONFIRMADA)
    )
  return [(slot, slot.cupos_totales - ocupados_por_slot[slot.id]) for slot in rows]


async def create_disponibilidad(db: AsyncSession, data: dict) -> DisponibilidadAdmin:
  slot = DisponibilidadAdmin(**data)
  db.add(slot)
  await db.flush()
  await db.refresh(slot)
  return slot


async def get_citas(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    residente_id: uuid.UUID | None = None,
    estado: EstadoCita | None = None,
) -> list[CitaAdmin]:
  query = (
    select(CitaAdmin)
    .where(CitaAdmin.tenant_id == tenant_id)
    .options(
      selectinload(CitaAdmin.disponibilidad),
      selectinload(CitaAdmin.residente),
      selectinload(CitaAdmin.unidad).selectinload(Unidad.torre),
    )
    .order_by(CitaAdmin.created_at.desc())
  )
  if residente_id:
    query = query.where(CitaAdmin.residente_id == residente_id)
  if estado:
    query = query.where(CitaAdmin.estado == estado)
  result = await db.execute(query)
  return list(result.scalars().all())


async def get_cita_by_id(
    db: AsyncSession, cita_id: uuid.UUID, tenant_id: uuid.UUID
) -> CitaAdmin | None:
  result = await db.execute(
    select(CitaAdmin)
    .where(CitaAdmin.id == cita_id, CitaAdmin.tenant_id == tenant_id)
    .options(
      selectinload(CitaAdmin.disponibilidad),
      selectinload(CitaAdmin.residente),
      selectinload(CitaAdmin.unidad).selectinload(Unidad.torre),
    )
  )
  return result.scalar_one_or_none()


async def count_citas_activas(
    db: AsyncSession, disponibilidad_id: uuid.UUID
) -> int:
  result = await db.execute(
    select(func.count()).select_from(CitaAdmin).where(
      CitaAdmin.disponibilidad_id == disponibilidad_id,
      CitaAdmin.estado.in_([EstadoCita.SOLICITADA, EstadoCita.CONFIRMADA]),
    )
  )
  return result.scalar_one()


async def create_cita(db: AsyncSession, data: dict) -> CitaAdmin:
  cita = CitaAdmin(**data)
  db.add(cita)
  await db.flush()
  result = await db.execute(
    select(CitaAdmin)
    .where(CitaAdmin.id == cita.id)
    .options(
      selectinload(CitaAdmin.disponibilidad),
      selectinload(CitaAdmin.residente),
      selectinload(CitaAdmin.unidad).selectinload(Unidad.torre),
    )
  )
  return result.scalar_one()


async def update_cita(db: AsyncSession, cita: CitaAdmin, data: dict) -> CitaAdmin:
  for key, value in data.items():
    setattr(cita, key, value)
  cita.updated_at = datetime.now()
  await db.flush()
  await db.refresh(cita)
  return cita
