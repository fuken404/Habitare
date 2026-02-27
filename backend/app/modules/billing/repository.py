import uuid
from datetime import datetime, timezone, date
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.modules.billing.models import (
    Factura, Pago, TransaccionPago, EstadoFactura, EstadoPago
)

# ======================================
#          FACTURA
# ======================================

async def get_facturas(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    unidad_id: uuid.UUID | None = None,
    estado: EstadoFactura | None = None,
  ) -> list[Factura]:
  query = (
    select(Factura)
    .where(Factura.tenant_id == tenant_id)
    .order_by(Factura.fecha_emision.desc())
  )
  if unidad_id:
    query = query.where(Factura.unidad_id == unidad_id)
  if estado:
    query = query.where(Factura.estado == estado)
  result = await db.execute(query)
  return list(result.scalars().all())

async def get_factura_by_id(
    db: AsyncSession, factura_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> Factura | None:
  result = await db.execute(
    select(Factura)
    .where(Factura.id == factura_id, Factura.tenant_id == tenant_id)
    .options(selectinload(Factura.pagos))
  )
  return result.scalar_one_or_none()

async def create_factura(db: AsyncSession, data: dict) -> Factura:
  factura = Factura(**data)
  db.add(factura)
  await db.flush()
  await db.refresh(factura)
  return factura

async def update_factura(
    db: AsyncSession, factura: Factura, data: dict
  ) -> Factura:
  for key, value in data.items():
    setattr(factura, key, value)
  factura.updated_at = datetime.now(timezone.utc)
  await db.flush()
  await db.refresh(factura)
  return factura

# ======================================
#          PAGO
# ======================================

async def get_pagos_factura(
    db: AsyncSession, factura_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> list[Pago]:
  result = await db.execute(
    select(Pago)
    .where(Pago.factura_id == factura_id, Pago.tenant_id == tenant_id)
    .options(selectinload(Pago.transacciones))
    .order_by(Pago.created_at.desc())
  )
  return list(result.scalars().all())

async def get_pago_by_id(
    db: AsyncSession, pago_id: uuid.UUID, tenant_id: uuid.UUID
  ) -> Pago | None:
  result = await db.execute(
    select(Pago)
    .where(Pago.id == pago_id, Pago.tenant_id == tenant_id)
    .options(selectinload(Pago.transacciones))
  )
  return result.scalar_one_or_none()

async def create_pago(db: AsyncSession, data: dict) -> Pago:
  pago = Pago(**data)
  db.add(pago)
  await db.flush()
  await db.refresh(pago)
  return pago

async def update_pago(
    db: AsyncSession, pago: Pago, data: dict
  ) -> Pago:
  for key, value in data.items():
    setattr(pago, key, value)
  pago.updated_at = datetime.now(timezone.utc)
  await db.flush()
  await db.refresh(pago)
  return pago

# ======================================
#          TRANSACCIÓN
# ======================================

async def create_transaccion(
    db: AsyncSession, pago_id: uuid.UUID, data: dict
  ) -> TransaccionPago:
  tx = TransaccionPago(pago_id=pago_id, **data)
  db.add(tx)
  await db.flush()
  await db.refresh(tx)
  return tx