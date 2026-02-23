import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tenants import repository as repo
from app.modules.tenants.schemas import (
  TenantCreate, TenantUpdate, TenantResponse,
  TorreCreate, TorreUpdate, TorreResponse,
  UnidadCreate, UnidadUpdate, UnidadResponse
)

# ======================================
#               TENANT
# ======================================

async def listar_tenants(db: AsyncSession) -> list[TenantResponse]:
  tenants = await repo.get_all_tenants(db)
  return [TenantResponse.model_validate(t) for t in tenants]

async def obtener_tenant(tenant_id: uuid.UUID, db: AsyncSession) -> TenantResponse:
  tenant = await repo.get_tenant_by_id(db, tenant_id)
  if not tenant:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conjunto no encontrado")
  return TenantResponse.model_validate(tenant)

async def crear_tenant(data: TenantCreate, db: AsyncSession) -> TenantResponse:
  tenant = await repo.create_tenant(db, data.model_dump(exclude_none=True))
  return TenantResponse.model_validate(tenant)

async def actualizar_tenant(tenant_id: uuid.UUID, data: TenantUpdate, db: AsyncSession) -> TenantResponse:
  tenant = await repo.get_tenant_by_id(db, tenant_id)
  if not tenant:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conjunto no encontrado")
  tenant = await repo.update_tenant(db, tenant, data.model_dump(exclude_none=True))
  return TenantResponse.model_validate(tenant)

# ======================================
#                 TORRE
# ======================================

async def listar_torres(tenant_id: uuid.UUID, db: AsyncSession) -> list[TorreResponse]:
  torres = await repo.get_torres_by_tenant(db, tenant_id)
  return [TorreResponse.model_validate(t) for t in torres]

async def obtener_torre(torre_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession) -> TorreResponse:
  torre = await repo.get_torre_by_id(db, torre_id, tenant_id)
  if not torre:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Torre no encontrada")
  return TorreResponse.model_validate(torre)

async def crear_torre(tenant_id: uuid.UUID, data: TorreCreate, db: AsyncSession) -> TorreResponse:
  torre = await repo.create_torre(db, tenant_id, data.model_dump(exclude_none=True))
  return TorreResponse.model_validate(torre)

async def actualizar_torre(torre_id: uuid.UUID, tenant_id: uuid.UUID, data: TorreUpdate, db: AsyncSession) -> TorreResponse:
  torre = await repo.get_torre_by_id(db, torre_id, tenant_id)
  if not torre:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Torre no encontrada")
  torre = await repo.update_torre(db, torre, data.model_dump(exclude_none=True))
  return TorreResponse.model_validate(torre)

async def eliminar_torre(torre_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession) -> None:
  torre = await repo.get_torre_by_id(db, torre_id, tenant_id)
  if not torre:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Torre no encontrada")
  await repo.delete_torre(db, torre)

# ======================================
#                 UNIDAD
# ======================================

async def listar_unidades_por_tenant(tenant_id: uuid.UUID, db: AsyncSession) -> list[UnidadResponse]:
  unidades = await repo.get_unidades_by_tenant(db, tenant_id)
  return [UnidadResponse.model_validate(u) for u in unidades]

async def listar_unidades_por_torres(tenant_id: uuid.UUID, torre_id: uuid.UUID, db: AsyncSession) -> list[UnidadResponse]:
  unidades = await repo.get_unidades_by_torre(db, tenant_id, torre_id)
  return [UnidadResponse.model_validate(u) for u in unidades]

async def obtener_unidad(unidad_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession) -> UnidadResponse:
  unidad = await repo.get_unidad_by_id(db, unidad_id, tenant_id)
  if not unidad:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unidad no encontrada")
  return UnidadResponse.model_validate(unidad)

async def crear_unidad(tenant_id: uuid.UUID, data: UnidadCreate, db: AsyncSession) -> UnidadResponse:
  unidad = await repo.create_unidad(db, tenant_id, data.model_dump(exclude_none=True))
  return UnidadResponse.model_validate(unidad)

async def actualizar_unidad(unidad_id: uuid.UUID, tenant_id: uuid.UUID, data: UnidadUpdate, db: AsyncSession) -> UnidadResponse:
  unidad = await repo.get_unidad_by_id(db, unidad_id, tenant_id)
  if not unidad:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unidad no encontrada")
  unidad = await repo.update_unidad(db, unidad, data.model_dump(exclude_none=True))
  return UnidadResponse.model_validate(unidad)

async def eliminar_unidad(unidad_id: uuid.UUID, tenant_id: uuid.UUID, db: AsyncSession) -> None:
  unidad = await repo.get_unidad_by_id(db, unidad_id, tenant_id)
  if not unidad:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unidad no encontrada")
  await repo.delete_unidad(db, unidad)