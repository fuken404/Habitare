import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.subscriptions.models import Plan, Suscripcion, PagoSuscripcion

# ======================================
#          PLAN
# ======================================

async def get_planes(
    db: AsyncSession, solo_activos: bool = True
  ) -> list[Plan]:
  query = select(Plan).order_by(Plan.created_at.asc())
  if solo_activos:
    query = query.where(Plan.is_activo == True)
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_plan_by_id(db: AsyncSession, plan_id: uuid.UUID) -> Plan | None:
  result = await db.execute(select(Plan).where(Plan.id == plan_id))
  return result.scalar_one_or_none()

async def create_plan(db: AsyncSession, data: dict) -> Plan:
  plan = Plan(**data)
  db.add(plan)
  await db.flush()
  await db.refresh(plan)
  return plan

async def update_plan(db: AsyncSession, plan: Plan, data: dict) -> Plan:
  for key, value in data.items():
    setattr(plan, key, value)
  plan.updated_at = datetime.now(timezone.utc)
  await db.flush()
  await db.refresh(plan)
  return plan

# ======================================
#          SUSCRIPCIÓN
# ======================================

async def get_suscripcion_by_tenant(
    db: AsyncSession, tenant_id: uuid.UUID
  ) -> Suscripcion | None:
  result = await db.execute(
    select(Suscripcion).where(Suscripcion.tenant_id == tenant_id)
  )
  return result.scalar_one_or_none()

async def get_suscripcion_by_id(
    db: AsyncSession, suscripcion_id: uuid.UUID
  ) -> Suscripcion | None:
  result = await db.execute(
    select(Suscripcion).where(Suscripcion.id == suscripcion_id)
  )
  return result.scalar_one_or_none()

async def get_suscripciones(db: AsyncSession) -> list[Suscripcion]:
  result = await db.execute(
    select(Suscripcion).order_by(Suscripcion.created_at.desc())
  )
  return list(result.scalars().all())

async def create_suscripcion(db: AsyncSession, data: dict) -> Suscripcion:
  suscripcion = Suscripcion(**data)
  db.add(suscripcion)
  await db.flush()
  await db.refresh(suscripcion)
  return suscripcion

async def update_suscripcion(
    db: AsyncSession, suscripcion: Suscripcion, data: dict
  ) -> Suscripcion:
  for key, value in data.items():
    setattr(suscripcion, key, value)
  suscripcion.updated_at = datetime.now(timezone.utc)
  await db.flush()
  await db.refresh(suscripcion)
  return suscripcion

# ======================================
#          PAGO SUSCRIPCIÓN
# ======================================

async def get_pagos_suscripcion(
    db: AsyncSession, suscripcion_id: uuid.UUID
  ) -> list[PagoSuscripcion]:
  result = await db.execute(
    select(PagoSuscripcion)
    .where(PagoSuscripcion.suscripcion_id == suscripcion_id)
    .order_by(PagoSuscripcion.created_at.desc())
  )
  return list(result.scalars().all())

async def create_pago_suscripcion(db: AsyncSession, data: dict) -> PagoSuscripcion:
  pago = PagoSuscripcion(**data)
  db.add(pago)
  await db.flush()
  await db.refresh(pago)
  return pago

async def update_pago_suscripcion(
    db: AsyncSession, pago: PagoSuscripcion, data: dict
  ) -> PagoSuscripcion:
  for key, value in data.items():
    setattr(pago, key, value)
  pago.updated_at = datetime.now(timezone.utc)
  await db.flush()
  await db.refresh(pago)
  return pago

async def get_pago_by_id(
    db: AsyncSession, pago_id: uuid.UUID
  ) -> PagoSuscripcion | None:
  result = await db.execute(
    select(PagoSuscripcion).where(PagoSuscripcion.id == pago_id)
  )
  return result.scalar_one_or_none()