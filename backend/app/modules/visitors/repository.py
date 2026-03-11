import uuid
from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.modules.visitors.models import (
    Visitante, AutorizacionVisita, VehiculoVisitante,
    IngresoVisita, EstadoAutorizacion
  )

# ======================================
#             VISITANTE
# ======================================

async def get_visitante_by_documento(db: AsyncSession, n_documento: str) -> Visitante | None:
  result = await db.execute(
    select(Visitante).where(Visitante.n_documento == n_documento)
  )
  return result.scalar_one_or_none()

async def get_visitante_by_id(db: AsyncSession, visitante_id: uuid.UUID) -> Visitante | None:
  result = await db.execute(select(Visitante).where(Visitante.id == visitante_id))
  return result.scalar_one_or_none()

async def create_visitante(db: AsyncSession, data: dict) -> Visitante:
  visitante = Visitante(**data)
  db.add(visitante)
  await db.flush()
  await db.refresh(visitante)
  return visitante

# ======================================
#         AUTORIZACIÓN DE VISITA
# ======================================

async def get_autorizacion_by_id(
    db: AsyncSession, autorizacion_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> AutorizacionVisita | None:
  result = await db.execute(
    select(AutorizacionVisita)
    .where(
      AutorizacionVisita.id == autorizacion_id,
      AutorizacionVisita.tenant_id == tenant_id
    )
    .options(
      selectinload(AutorizacionVisita.visitante),
      selectinload(AutorizacionVisita.vehiculos),
    )
  )
  return result.scalar_one_or_none()

async def get_autorizaciones_by_tenant(
    db: AsyncSession, tenant_id: uuid.UUID, fecha: date | None = None,
    unidad_id: uuid.UUID | None = None
  ) -> list[AutorizacionVisita]:
  query = (
    select(AutorizacionVisita)
    .where(AutorizacionVisita.tenant_id == tenant_id)
    .options(
      selectinload(AutorizacionVisita.visitante),
      selectinload(AutorizacionVisita.vehiculos),
      selectinload(AutorizacionVisita.unidad),
    )
    .order_by(AutorizacionVisita.fecha_visita.desc())
  )
  if fecha:
    query = query.where(AutorizacionVisita.fecha_visita == fecha)
  if unidad_id:
    query = query.where(AutorizacionVisita.unidad_id == unidad_id)
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_autorizacion_activa_por_documento(
  db: AsyncSession, tenant_id: uuid.UUID, n_documento: str, fecha: date
  ) -> AutorizacionVisita | None:
  result = await db.execute(
    select(AutorizacionVisita)
    .join(Visitante, Visitante.id == AutorizacionVisita.visitante_id)
    .where(
      AutorizacionVisita.tenant_id == tenant_id,
      AutorizacionVisita.fecha_visita == fecha,
      AutorizacionVisita.estado == EstadoAutorizacion.ACTIVA,
      Visitante.n_documento == n_documento,
    )
    .options(
      selectinload(AutorizacionVisita.visitante),
      selectinload(AutorizacionVisita.vehiculos),
    )
  )
  return result.scalar_one_or_none()

async def create_autorizacion(db: AsyncSession, data: dict) -> AutorizacionVisita:
  autorizacion = AutorizacionVisita(**data)
  db.add(autorizacion)
  await db.flush()
  await db.refresh(autorizacion)
  return autorizacion

async def update_autorizacion(
    db: AsyncSession, autorizacion: AutorizacionVisita, data: dict
  ) -> AutorizacionVisita:
  for key, value in data.items():
    setattr(autorizacion, key, value)
  autorizacion.updated_at = datetime.utcnow()
  await db.flush()
  await db.refresh(autorizacion)
  return autorizacion

async def create_vehiculo(
    db: AsyncSession, tenant_id: uuid.UUID, autorizacion_id: uuid.UUID, data: dict
  ) -> VehiculoVisitante:
  vehiculo = VehiculoVisitante(tenant_id=tenant_id, autorizacion_id=autorizacion_id, **data)
  db.add(vehiculo)
  await db.flush()
  return vehiculo

# ======================================
#           INGRESO DE VISITA
# ======================================

async def get_ingresos_by_tenant(
    db: AsyncSession, tenant_id: uuid.UUID, fecha: date | None = None
  ) -> list[IngresoVisita]:
  query = (
    select(IngresoVisita)
    .where(IngresoVisita.tenant_id == tenant_id)
    .options(selectinload(IngresoVisita.visitante))
    .order_by(IngresoVisita.fecha_hora_ingreso.desc())
  )
  if fecha:
    query = query.where(
      IngresoVisita.fecha_hora_ingreso >= datetime.combine(fecha, datetime.min.time()),
      IngresoVisita.fecha_hora_ingreso < datetime.combine(fecha, datetime.max.time()),
    )
  result = await db.execute(query)
  return list(result.scalars().all())

async def create_ingreso(db: AsyncSession, data: dict) -> IngresoVisita:
  ingreso = IngresoVisita(**data)
  db.add(ingreso)
  await db.flush()
  await db.refresh(ingreso)
  return ingreso
