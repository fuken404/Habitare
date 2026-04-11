import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_db
from app.dependencies import require_roles, get_tenant_id
from app.modules.users.models import TipoRol
from app.modules.auth.schemas import MeResponse
from app.modules.visitor_parking.schemas import (
    LugarParqueaderoVisitanteCreate, LugarParqueaderoVisitanteResponse,
    ParqueaderoVisitanteCreate, ParqueaderoVisitanteResponse,
  )
from app.modules.visitor_parking import service as vp_service

router = APIRouter(prefix="/parqueadero-visitantes", tags=["Parqueadero Visitantes"])

_ROLES_OPERACION = (TipoRol.SEGURIDAD, TipoRol.RECEPCION, TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)
_ROLES_ADMIN = (TipoRol.ADMINISTRACION, TipoRol.SUPERADMIN)


# ──────────────────────────────────────────────
#   LUGARES
# ──────────────────────────────────────────────

@router.get("/lugares", response_model=list[LugarParqueaderoVisitanteResponse])
async def listar_lugares(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await vp_service.listar_lugares(tenant_id, db)


@router.post(
    "/lugares",
    response_model=LugarParqueaderoVisitanteResponse,
    status_code=status.HTTP_201_CREATED,
  )
async def crear_lugar(
    body: LugarParqueaderoVisitanteCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  return await vp_service.crear_lugar(tenant_id, body, db)


@router.delete("/lugares/{lugar_id}", status_code=status.HTTP_204_NO_CONTENT)
async def desactivar_lugar(
    lugar_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_ADMIN)),
    db: AsyncSession = Depends(get_db),
  ):
  await vp_service.desactivar_lugar(lugar_id, tenant_id, db)


# ──────────────────────────────────────────────
#   ASIGNACIONES
# ──────────────────────────────────────────────

@router.get("", response_model=list[ParqueaderoVisitanteResponse])
async def listar_activos(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await vp_service.listar_activos(tenant_id, db)


@router.post("", response_model=ParqueaderoVisitanteResponse, status_code=status.HTTP_201_CREATED)
async def asignar(
    body: ParqueaderoVisitanteCreate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await vp_service.asignar(tenant_id, body, db)


@router.patch("/{pv_id}/liberar", response_model=ParqueaderoVisitanteResponse)
async def liberar(
    pv_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    _: MeResponse = Depends(require_roles(*_ROLES_OPERACION)),
    db: AsyncSession = Depends(get_db),
  ):
  return await vp_service.liberar(pv_id, tenant_id, db)
