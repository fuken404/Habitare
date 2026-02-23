import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone

from app.modules.tenants.models import Tenant, Torre, Unidad

# ======================================
#               TENANT
# ======================================

async def get_tenant_by_id(db: AsyncSession, tenant_id: uuid.UUID) -> Tenant | None:
  result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
  return result.scalar_one_or_none()

async def get_all_tenants(db: AsyncSession) -> list[Tenant]:
  result = await db.execute(select(Tenant).order_by(Tenant.nombre))
  return list(result.scalars().all())

async def create_tenant(db: AsyncSession, data: dict) -> Tenant:
  tenant = Tenant(**data)
  db.add(tenant)
  await db.flush()
  await db.refresh(tenant)
  return tenant

async def update_tenant(db: AsyncSession, tenant: Tenant, data: dict) -> Tenant:
  update_data = {k: v for k, v in data.items() if v is not None}
  for key, value in update_data.items():
    setattr(tenant, key, value)
  tenant.updated_at = datetime.now(timezone.utc)
  await db.flush()
  await db.refresh(tenant)
  return tenant

# ======================================
#                 TORRE
# ======================================

async def get_torres_by_tenant(db: AsyncSession, tenant_id: uuid.UUID) -> list[Torre]:
  result = await db.execute(
    select(Torre).where(Torre.tenant_id == tenant_id).order_by(Torre.nombre)
  )
  return list(result.scalars().all())

async def get_torre_by_id(db: AsyncSession, torre_id: uuid.UUID, tenant_id: uuid.UUID) -> Torre | None:
  result = await db.execute(
    select(Torre).where(Torre.id == torre_id, Torre.tenant_id == tenant_id)
  )
  return result.scalar_one_or_none()

async def create_torre(db: AsyncSession, tenant_id: uuid.UUID, data: dict) -> Torre:
  torre = Torre(tenant_id=tenant_id, **data)
  db.add(torre)
  await db.flush()
  await db.refresh(torre)
  return torre

async def update_torre(db: AsyncSession, torre: Torre, data: dict) -> Torre:
  update_data = {k: v for k, v in data.items() if v is not None}
  for key, value in update_data.items():
    setattr(torre, key, value)
  torre.updated_at = datetime.now(timezone.utc)
  await db.flush()
  await db.refresh(torre)
  return torre

async def delete_torre(db: AsyncSession, torre: Torre) -> None:
  await db.delete(torre)
  await db.flush()

# ======================================
#                 UNIDAD
# ======================================

async def get_unidades_by_tenant(db: AsyncSession, tenant_id: uuid.UUID) -> list[Unidad]:
  result = await db.execute(
    select(Unidad).where(Unidad.tenant_id == tenant_id).order_by(Unidad.numero)
  )
  return list(result.scalars().all())

async def get_unidades_by_torre(db: AsyncSession, tenant_id: uuid.UUID, torre_id: uuid.UUID) -> list[Unidad]:
  result = await db.execute(
    select(Unidad).where(Unidad.tenant_id == tenant_id, Unidad.torre_id == torre_id).order_by(Unidad.numero)
  )
  return list(result.scalars().all())

async def get_unidad_by_id(db: AsyncSession, unidad_id: uuid.UUID, tenant_id: uuid.UUID) -> Unidad | None:
  result = await db.execute(
    select(Unidad).where(Unidad.id == unidad_id, Unidad.tenant_id == tenant_id)
  )
  return result.scalar_one_or_none()

async def create_unidad(db: AsyncSession, tenant_id: uuid.UUID, data: dict) -> Unidad:
  unidad = Unidad(tenant_id = tenant_id, **data)
  db.add(unidad)
  await db.flush()
  await db.refresh(unidad)
  return unidad

async def update_unidad(db: AsyncSession, unidad: Unidad, data: dict) -> Unidad:
  update_data = {k: v for k, v in data.items() if v is not None}
  for key, value in update_data.items():
    setattr(unidad, key, value)
  unidad.updated_at = datetime.now(timezone.utc)
  await db.flush()
  await db.refresh(unidad)
  return unidad

async def delete_unidad(db: AsyncSession, unidad: Unidad) -> None:
  await db.delete(unidad)
  await db.flush()