import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import get_current_user, require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.tenants.schemas import (
  TenantCreate, TenantUpdate, TenantResponse,
  TorreCreate, TorreUpdate, TorreResponse,
  UnidadCreate, UnidadUpdate, UnidadResponse
)
from app.modules.tenants import service as tenants_service

router =  APIRouter(tags=["Conjuntos"])

# ======================================
#      TENANTS — solo Superadmin
# ======================================

@router.get("/tenants", response_model=list[TenantResponse])
async def listar_tenants(
  _: MeResponse = Depends(require_roles(TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  return await tenants_service.listar_tenants(db)

@router.get("/tenants/{tenant_id}", response_model=TenantResponse)
async def obtener_tenant(
  tenant_id: uuid.UUID,
  _: MeResponse = Depends(require_roles(TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  return await tenants_service.obtener_tenant(tenant_id, db)

@router.patch("/tenants/{tenant_id}", response_model=TenantResponse)
async def actualizar_tenant(
  tenant_id: uuid.UUID,
  body: TenantUpdate,
  _: MeResponse = Depends(require_roles(TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  return await tenants_service.actualizar_tenant(tenant_id, body, db)

# ======================================
#      TORRES — Admin del conjunto
# ======================================

@router.get("/torres", response_model=list[TorreResponse])
async def listar_torres(
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  return await tenants_service.listar_torres(tenant_id, db)

@router.get("/torres/{torre_id}", response_model=TorreResponse)
async def obtener_torre(
  torre_id: uuid.UUID,
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  return await tenants_service.obtener_torre(torre_id, tenant_id, db)

@router.get("/torres/unidades", response_model=list[UnidadResponse])
async def listar_unidades_por_torre(
  torre_id: uuid.UUID,
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  return await tenants_service.listar_unidades_por_torres(tenant_id, torre_id, db)

@router.post("/torres", response_model=TorreResponse, status_code=status.HTTP_201_CREATED)
async def crear_torre(
  body: TorreCreate,
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  return await tenants_service.crear_torre(tenant_id, body, db)

@router.patch("/torres/{torre_id}", response_model=TorreResponse)
async def actualizar_torre(
  torre_id: uuid.UUID,
  body: TorreUpdate,
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  return await tenants_service.actualizar_torre(torre_id, tenant_id, body, db)

@router.delete("/torres/{torre_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_torre(
  torre_id: uuid.UUID,
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  await tenants_service.eliminar_torre(torre_id, tenant_id, db)

# ======================================
#     UNIDADES — Admin del conjunto
# ======================================

@router.get("/unidades", response_model=list[UnidadResponse])
async def listar_unidades_por_tenant(
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  return await tenants_service.listar_unidades_por_tenant(tenant_id, db)

@router.get("/unidades/{unidad_id}", response_model=UnidadResponse)
async def obtener_unidad(
  unidad_id: uuid.UUID,
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  return await tenants_service.obtener_unidad(unidad_id, tenant_id, db)

@router.post("/unidades", response_model=UnidadResponse, status_code=status.HTTP_201_CREATED)
async def crear_unidad(
  body: UnidadCreate,
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  return await tenants_service.crear_unidad(tenant_id, body, db)

@router.patch("/unidades/{unidad_id}", response_model=UnidadResponse)
async def actualizar_unidad(
  unidad_id: uuid.UUID,
  body: UnidadUpdate,
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  return await tenants_service.actualizar_unidad(unidad_id, tenant_id, body, db)

@router.delete("/unidades/{unidad_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_unidad(
  unidad_id: uuid.UUID, 
  tenant_id: uuid.UUID = Depends(get_tenant_id),
  _: MeResponse = Depends(require_roles(TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)),
  db: AsyncSession = Depends(get_db)
  ):
  await tenants_service.eliminar_unidad(unidad_id, tenant_id, db)